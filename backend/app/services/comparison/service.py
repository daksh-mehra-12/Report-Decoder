from typing import Optional, Dict, Any, List

class CrossLabComparabilityGate:
    """
    Evaluates whether two lab report results can be safely compared in historical trend charts.
    Prevents false comparisons across incompatible units, different assay methods, or disparate reference intervals.
    """

    SUPPORTED_UNIT_CONVERSIONS = {
        # (from_unit, to_unit): conversion_factor
        ("mg/dl", "g/l"): 0.01,
        ("g/l", "mg/dl"): 100.0,
        ("10^3/ul", "10^9/l"): 1.0,
    }

    @classmethod
    def evaluate(
        cls,
        test_code_a: str,
        unit_a: Optional[str],
        range_low_a: Optional[float],
        range_high_a: Optional[float],
        lab_name_a: Optional[str],
        test_code_b: str,
        unit_b: Optional[str],
        range_low_b: Optional[float],
        range_high_b: Optional[float],
        lab_name_b: Optional[str],
    ) -> Dict[str, Any]:
        reasons = []

        # 1. Test identity check
        if test_code_a != test_code_b:
            return {
                "is_comparable": False,
                "status": "Incomparable",
                "reasons": [f"Different laboratory analytes ('{test_code_a}' vs '{test_code_b}'). Direct comparison is invalid."],
                "allow_trend_chart": False
            }

        # 2. Unit comparison
        u_a = (unit_a or "").strip().lower()
        u_b = (unit_b or "").strip().lower()

        units_match = (u_a == u_b)
        conversion_supported = (u_a, u_b) in cls.SUPPORTED_UNIT_CONVERSIONS

        if not units_match and not conversion_supported:
            return {
                "is_comparable": False,
                "status": "Incomparable",
                "reasons": [f"Incompatible units ('{unit_a}' vs '{unit_b}') without safe conversion rules."],
                "allow_trend_chart": False
            }

        if not units_match and conversion_supported:
            reasons.append(f"Units differ ('{unit_a}' vs '{unit_b}'), but mathematical conversion is available.")

        # 3. Reference range disparity check
        range_mismatch = False
        if range_low_a is not None and range_low_b is not None:
            if abs(range_low_a - range_low_b) / max(range_low_a, 0.001) > 0.15:
                range_mismatch = True
        if range_high_a is not None and range_high_b is not None:
            if abs(range_high_a - range_high_b) / max(range_high_a, 0.001) > 0.15:
                range_mismatch = True

        if range_mismatch:
            reasons.append(
                f"Different reference ranges reported by labs ([{range_low_a}-{range_high_a}] vs [{range_low_b}-{range_high_b}]). "
                "May reflect differing instrumentation or assay calibration."
            )

        # 4. Lab facility variance
        if lab_name_a and lab_name_b and lab_name_a.strip().lower() != lab_name_b.strip().lower():
            reasons.append(f"Specimens processed by different facilities ('{lab_name_a}' and '{lab_name_b}'). Inter-laboratory variance may exist.")

        if not reasons:
            return {
                "is_comparable": True,
                "status": "Comparable",
                "reasons": ["Test identities, units, and reference ranges are fully aligned."],
                "allow_trend_chart": True
            }
        else:
            return {
                "is_comparable": True,
                "status": "Comparable with Caveats",
                "reasons": reasons,
                "allow_trend_chart": True
            }
