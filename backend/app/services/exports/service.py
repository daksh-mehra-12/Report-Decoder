import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.models.models import Report, ReportParameter
from app.services.visitready.service import VisitReadyService

class PdfExportService:
    """
    Generates a professional doctor-ready summary PDF for an authorized lab report.
    """

    @classmethod
    def generate_doctor_summary_pdf(cls, report: Report, parameters: list[ReportParameter]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()

        # Custom typography styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            textColor=colors.HexColor('#0B132B'),
            spaceAfter=4
        )

        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#475569'),
            spaceAfter=12
        )

        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            textColor=colors.HexColor('#0F172A'),
            spaceBefore=10,
            spaceAfter=6
        )

        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            textColor=colors.HexColor('#64748B'),
            spaceBefore=10
        )

        cell_text = ParagraphStyle('Cell', parent=styles['Normal'], fontSize=8.5, leading=10)
        cell_bold = ParagraphStyle('CellBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=10)

        story = []

        # Header with branding and metadata
        story.append(Paragraph("LabLens — Clinical Report Summary", title_style))
        story.append(Paragraph("Tagline: Understand your report. Prepare for a better conversation. | AAYU 2026", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceAfter=10))

        # Metadata table
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        meta_data = [
            [
                Paragraph(f"<b>Report File:</b> {report.file_name}", cell_text),
                Paragraph(f"<b>Report Date:</b> {report.report_date or 'Not Specified'}", cell_text)
            ],
            [
                Paragraph(f"<b>Laboratory:</b> {report.lab_name or 'Independent Clinical Lab'}", cell_text),
                Paragraph(f"<b>Generated At:</b> {now_str}", cell_text)
            ]
        ]
        t_meta = Table(meta_data, colWidths=[270, 260])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 12))

        # Section: Verified Laboratory Findings
        story.append(Paragraph("Verified Laboratory Findings & Deterministic Status", section_heading))

        table_rows = [
            [
                Paragraph("Test Analyte", cell_bold),
                Paragraph("Result", cell_bold),
                Paragraph("Unit", cell_bold),
                Paragraph("Printed Ref Range", cell_bold),
                Paragraph("Classification", cell_bold),
                Paragraph("Verification", cell_bold)
            ]
        ]

        for p in parameters:
            status_color = colors.HexColor('#16A34A') if p.classification_status == "In Range" else colors.HexColor('#DC2626')
            status_para = Paragraph(f"<font color='{status_color.hexval()}'><b>{p.classification_status}</b></font>", cell_text)

            table_rows.append([
                Paragraph(f"<b>{p.test_name}</b>", cell_text),
                Paragraph(str(p.numeric_value or p.raw_value or "-"), cell_text),
                Paragraph(p.unit or "-", cell_text),
                Paragraph(p.reference_range_raw or "Unspecified", cell_text),
                status_para,
                Paragraph(p.verification_status.replace("_", " ").title(), cell_text)
            ])

        t_results = Table(table_rows, colWidths=[150, 65, 60, 110, 85, 60])
        t_results.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t_results)
        story.append(Spacer(1, 14))

        # Section: VisitReady Doctor Conversation Prompts
        story.append(Paragraph("VisitReady™ Clinician Discussion Prompts", section_heading))
        vr_data = VisitReadyService.generate(report, parameters, language="en")

        for idx, q in enumerate(vr_data["suggested_questions"]):
            q_p = Paragraph(f"<b>{idx+1}. [{q['category']}]</b> {q['question_text']}", cell_text)
            story.append(q_p)
            story.append(Spacer(1, 4))

        story.append(Spacer(1, 14))

        # Non-Diagnostic & Safety Disclaimer
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=8))
        story.append(Paragraph(
            "<b>IMPORTANT CLINICAL NOTICE:</b> LabLens is an educational reporting and patient communication tool. "
            "It is NOT a medical device, diagnostic system, or treatment planner. Out-of-range results do not establish a diagnosis; "
            "in-range results do not guarantee optimal health. All findings must be interpreted by a licensed clinician "
            "in the context of clinical history, physical examination, and symptoms.",
            disclaimer_style
        ))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
