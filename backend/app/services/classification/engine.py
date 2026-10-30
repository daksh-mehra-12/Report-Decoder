import re
from decimal import Decimal, InvalidOperation
from typing import Optional, Tuple, Dict, Any

RULE_ENGINE_VERSION = "1.0.0"

class ClassificationStatus:
    IN_RANGE = "In Range"
    BELOW_RANGE = "Below Range"
    ABOVE_RANGE = "Above Range"
    NEEDS_VERIFICATION = "Needs Verification"
    UNABLE_TO_CLASSIFY = "Unable to Classify"

class DeterministicClassificationEngine:
    """
    Independent, standalone deterministic laboratory report classification engine.
    Principle: Algorithmic arithmetic comparison against the printed reference range on the report.
    Never uses probabilistic models, LLMs, or speculative guesswork.
    """
    VERSION = RULE_ENGINE_VERSION

    # Recognized qualitative negative/normal values
    QUALITATIVE_NORMAL = {"negative", "non-reactive", "non reactive", "nil", "absent", "normal"}
    QUALITATIVE_ABNORMAL = {"positive", "reactive", "present", "abnormal"}

    @classmethod
    def parse_range_string(cls, range_str: Optional[str]) -> Tuple[Optional[Decimal], Optional[Decimal], Optional[str]]:
        """
        Parses common reference range patterns:
        - "12.0 - 15.5" -> (12.0, 15.5, 'interval')
        - "< 100" or "<= 100" -> (None, 100.0, 'upper_bound')
        - "> 60" or ">= 60" -> (60.0, None, 'lower_bound')
        - "12.0 to 15.5" -> (12.0, 15.5, 'interval')
        """
        if not range_str or not range_str.strip():
            return None, None, None

        cleaned = range_str.strip()

        # Interval format: X - Y or X to Y
        interval_match = re.search(r"^\s*([\d\.]+)\s*(?:-|–|—|to)\s*([\d\.]+)\s*$", cleaned, re.IGNORECASE)
        if interval_match:
            try:
                low = Decimal(interval_match.group(1))
                high = Decimal(interval_match.group(2))
                return low, high, "interval"
            except InvalidOperation:
                pass

        # Upper bound: < X or <= X
        upper_match = re.search(r"^\s*(?:<|<=|less than)\s*([\d\.]+)\s*$", cleaned, re.IGNORECASE)
        if upper_match:
            try:
                high = Decimal(upper_match.group(1))
                return None, high, "upper_bound"
            except InvalidOperation:
                pass

        # Lower bound: > X or >= X
        lower_match = re.search(r"^\s*(?:>|>=|greater than)\s*([\d\.]+)\s*$", cleaned, re.IGNORECASE)
        if lower_match:
            try:
                low = Decimal(lower_match.group(1))
                return low, None, "lower_bound"
            except InvalidOperation:
                pass

        return None, None, None

    @classmethod
    def classify(
        cls,
        test_name: str,
        numeric_value: Optional[float] = None,
        raw_value: Optional[str] = None,
        unit: Optional[str] = None,
        range_low: Optional[float] = None,
        range_high: Optional[float] = None,
        reference_range_raw: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Executes deterministic classification with strict boundary semantics.
        Invariants:
        1. Low <= Value <= High => 'In Range' (inclusive boundary)
        2. Value < Low => 'Below Range'
        3. Value > High => 'Above Range'
        4. Missing range => 'Needs Verification' (NEVER guess universal default)
        5. Malformed/missing value => 'Unable to Classify'
        """
        # Handle qualitative results first if raw_value is non-numeric text
        if raw_value and not raw_value.strip().replace(".", "", 1).isdigit():
            val_norm = raw_value.strip().lower()
            if val_norm in cls.QUALITATIVE_NORMAL:
                return {
                    "status": ClassificationStatus.IN_RANGE,
                    "reason": f"Qualitative result '{raw_value.strip()}' corresponds to standard non-reactive/normal threshold.",
                    "rule_version": cls.VERSION,
                    "is_boundary_exact": False,
                    "details": {"type": "qualitative", "value": raw_value}
                }
            elif val_norm in cls.QUALITATIVE_ABNORMAL:
                return {
                    "status": ClassificationStatus.ABOVE_RANGE,
                    "reason": f"Qualitative result '{raw_value.strip()}' indicates reactive/abnormal finding.",
                    "rule_version": cls.VERSION,
                    "is_boundary_exact": False,
                    "details": {"type": "qualitative", "value": raw_value}
                }

        # Value check
        if numeric_value is None and raw_value:
            try:
                # Clean stray chars (like commas or whitespace)
                cleaned_val = re.sub(r"[^\d\.]", "", raw_value.strip())
                if cleaned_val:
                    numeric_value = float(cleaned_val)
            except ValueError:
                pass

        if numeric_value is None:
            return {
                "status": ClassificationStatus.UNABLE_TO_CLASSIFY,
                "reason": "Missing or non-numeric test value. Quantitative evaluation cannot proceed.",
                "rule_version": cls.VERSION,
                "is_boundary_exact": False,
                "details": {"error": "missing_numeric_value"}
            }

        val_dec = Decimal(str(numeric_value))

        # Check bounds: explicit low/high or parse reference_range_raw
        low_dec = Decimal(str(range_low)) if range_low is not None else None
        high_dec = Decimal(str(range_high)) if range_high is not None else None

        if low_dec is None and high_dec is None and reference_range_raw:
            parsed_low, parsed_high, bound_type = cls.parse_range_string(reference_range_raw)
            low_dec = parsed_low
            high_dec = parsed_high

        # If reference range is entirely absent
        if low_dec is None and high_dec is None:
            return {
                "status": ClassificationStatus.NEEDS_VERIFICATION,
                "reason": "No printed reference interval available on report. LabLens does not substitute universal ranges.",
                "rule_version": cls.VERSION,
                "is_boundary_exact": False,
                "details": {"error": "missing_reference_range"}
            }

        # Check upper-bound only (e.g. < 100)
        if low_dec is None and high_dec is not None:
            if val_dec <= high_dec:
                is_exact = (val_dec == high_dec)
                return {
                    "status": ClassificationStatus.IN_RANGE,
                    "reason": f"Value {val_dec} is within upper threshold (<= {high_dec}).",
                    "rule_version": cls.VERSION,
                    "is_boundary_exact": is_exact,
                    "details": {"high": float(high_dec), "val": float(val_dec)}
                }
            else:
                return {
                    "status": ClassificationStatus.ABOVE_RANGE,
                    "reason": f"Value {val_dec} exceeds printed upper threshold of {high_dec}.",
                    "rule_version": cls.VERSION,
                    "is_boundary_exact": False,
                    "details": {"high": float(high_dec), "val": float(val_dec)}
                }

        # Check lower-bound only (e.g. > 60)
        if high_dec is None and low_dec is not None:
            if val_dec >= low_dec:
                is_exact = (val_dec == low_dec)
                return {
                    "status": ClassificationStatus.IN_RANGE,
                    "reason": f"Value {val_dec} meets printed lower threshold (>= {low_dec}).",
                    "rule_version": cls.VERSION,
                    "is_boundary_exact": is_exact,
                    "details": {"low": float(low_dec), "val": float(val_dec)}
                }
            else:
                return {
                    "status": ClassificationStatus.BELOW_RANGE,
                    "reason": f"Value {val_dec} falls below printed lower threshold of {low_dec}.",
                    "rule_version": cls.VERSION,
                    "is_boundary_exact": False,
                    "details": {"low": float(low_dec), "val": float(val_dec)}
                }

        # Standard interval check: [low, high]
        is_exact = (val_dec == low_dec or val_dec == high_dec)
        if val_dec < low_dec:
            return {
                "status": ClassificationStatus.BELOW_RANGE,
                "reason": f"Value {val_dec} is strictly below lower reference limit ({low_dec}).",
                "rule_version": cls.VERSION,
                "is_boundary_exact": False,
                "details": {"low": float(low_dec), "high": float(high_dec), "val": float(val_dec)}
            }
        elif val_dec > high_dec:
            return {
                "status": ClassificationStatus.ABOVE_RANGE,
                "reason": f"Value {val_dec} is strictly above upper reference limit ({high_dec}).",
                "rule_version": cls.VERSION,
                "is_boundary_exact": False,
                "details": {"low": float(low_dec), "high": float(high_dec), "val": float(val_dec)}
            }
        else:
            return {
                "status": ClassificationStatus.IN_RANGE,
                "reason": f"Value {val_dec} lies within printed reference range [{low_dec} - {high_dec}].",
                "rule_version": cls.VERSION,
                "is_boundary_exact": is_exact,
                "details": {"low": float(low_dec), "high": float(high_dec), "val": float(val_dec)}
            }
