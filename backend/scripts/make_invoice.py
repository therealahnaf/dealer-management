from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.utils import ImageReader
from datetime import datetime
import os

styles = getSampleStyleSheet()
small = ParagraphStyle(
    "small",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8,
    leading=10,
    alignment=TA_LEFT,
    splitLongWords=False,
)
small_right = ParagraphStyle(
    "small_right",
    parent=small,
    alignment=TA_RIGHT,
    splitLongWords=False,
)
small_bold = ParagraphStyle(
    "small_bold",
    parent=small,
    fontName="Helvetica-Bold",
)
small_bold_right = ParagraphStyle(
    "small_bold_right",
    parent=small_bold,
    alignment=TA_RIGHT,
    splitLongWords=False,
)

def currency(x):
    try:
        return f"{float(x):,.2f}"
    except Exception:
        return str(x)

def p_txt(txt, style=small):
    # replace explicit newlines so they wrap within table cells
    return Paragraph(str(txt).replace("\n", "<br/>"), style)

def kv_pairs_to_4col_rows(left_rows, right_rows):
    """
    Take two KV lists and return a list of rows: [L-Label, L-Value, R-Label, R-Value],
    padding the shorter side with empty cells so the overall table heights match.
    """
    n = max(len(left_rows), len(right_rows))
    rows = []
    for i in range(n):
        if i < len(left_rows):
            ll, lv = left_rows[i]
            l_lab = p_txt(f"{ll} :", small_bold)
            l_val = p_txt(lv, small)
        else:
            l_lab = p_txt("", small_bold)
            l_val = p_txt("", small)

        if i < len(right_rows):
            rl, rv = right_rows[i]
            r_lab = p_txt(f"{rl} :", small_bold)
            # right values usually align right (numbers), but mixed content is fine
            r_val = p_txt(rv if rv is not None else "", small_right)
        else:
            r_lab = p_txt("", small_bold)
            r_val = p_txt("", small_right)

        rows.append([l_lab, l_val, r_lab, r_val])
    return rows

def draw_box_table(c, x, y_top, total_w, col_widths, rows, pad=3*mm, box_radius=3, emphasize_last_right_value=False):
    """
    Render a 4-column table with a BOX border. If emphasize_last_right_value=True,
    the last row's right value will be bold & slightly larger.
    """
    # Optionally emphasize the last row right-side value (e.g., TOTAL PAYABLE)
    tbl_rows = []
    for ri, r in enumerate(rows):
        # r = [L-lab, L-val, R-lab, R-val] (Paragraphs)
        if emphasize_last_right_value and ri == len(rows) - 1:
            # Make right value bold + a bit larger
            rv_txt = r[3].getPlainText()
            tbl_rows.append([
                r[0],
                r[1],
                r[2],
                Paragraph(rv_txt, ParagraphStyle("total_bold_right", parent=small_bold_right, fontSize=9))
            ])
        else:
            tbl_rows.append(r)

    t = Table(tbl_rows, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BOX", (0,0), (-1,-1), 0.4, colors.black),
        ("INNERGRID", (0,0), (-1,-1), 0.4, colors.grey),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), pad),
        ("RIGHTPADDING", (0,0), (-1,-1), pad),
        ("TOPPADDING", (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
    ]))
    tw, th = t.wrapOn(c, total_w, 9999)
    # Draw background rounded rectangle for aesthetics (optional). If you want only the table box, comment next line.
    # c.roundRect(x, y_top - th, total_w, th, box_radius, stroke=0, fill=0)
    t.drawOn(c, x, y_top - th)
    return th

def draw_two_col_table(
    c,
    x,
    y_top,
    total_w,
    col_widths,
    rows,
    pad=3*mm,
    bordered=True,
    emphasize_last_right_value=False,
    grid=True,
    force_total_height=None,
    extra_style=None,
    measure_only=False,
):
    """
    Render a simple 2-column table. If bordered=False, no box/grid lines are drawn.
    If emphasize_last_right_value=True, last row's right value is bold-right.
    Returns the table height.
    """
    tbl_rows = []
    for ri, r in enumerate(rows):
        # r = [label, value]
        if emphasize_last_right_value and ri == len(rows) - 1:
            rv_txt = r[1].getPlainText() if isinstance(r[1], Paragraph) else str(r[1])
            tbl_rows.append([
                r[0],
                # Keep bold but same size as normal small style
                Paragraph(rv_txt, ParagraphStyle("total_bold_right", parent=small_bold_right)),
            ])
        else:
            tbl_rows.append(r)

    # Initial table to measure
    t = Table(tbl_rows, colWidths=col_widths)
    style_cmds = [
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), pad),
        ("RIGHTPADDING", (0,0), (-1,-1), pad),
        ("TOPPADDING", (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
    ]
    if bordered:
        style_cmds.insert(0, ("BOX", (0,0), (-1,-1), 0.4, colors.black))
        if grid:
            style_cmds.insert(1, ("INNERGRID", (0,0), (-1,-1), 0.4, colors.grey))
    if extra_style:
        style_cmds.extend(extra_style)
    t.setStyle(TableStyle(style_cmds))
    tw, th = t.wrapOn(c, total_w, 9999)

    # If a target height is required, and current is smaller, add a filler row
    if force_total_height and th < force_total_height:
        extra_h = force_total_height - th
        # append empty row
        tbl_rows_filled = list(tbl_rows) + [[Paragraph("", small), Paragraph("", small)]]
        # row heights: None for existing rows, extra_h for last
        row_heights = [None] * (len(tbl_rows_filled) - 1) + [extra_h]
        t = Table(tbl_rows_filled, colWidths=col_widths, rowHeights=row_heights)
        t.setStyle(TableStyle(style_cmds))
        tw, th = t.wrapOn(c, total_w, 9999)

    t.drawOn(c, x, y_top - th)
    return th

def make_invoice_tables(data: dict, filename: str):
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4
    margin = 12*mm
    x0 = margin
    y = height  # start at absolute top for edge-to-edge header

    # Header image (ask_header.jpg) if available
    script_dir = os.path.dirname(os.path.abspath(__file__))
    header_path = os.path.join(script_dir, "ask_header.jpg")
    if os.path.exists(header_path):
        try:
            header_img = ImageReader(header_path)
            img_w, img_h = header_img.getSize()
            avail_w = width  # full page width, no left/right margin
            # scale to fit page width, preserve aspect ratio
            draw_w = avail_w
            draw_h = draw_w * (img_h / img_w)
            c.drawImage(header_img, 0, y - draw_h, width=draw_w, height=draw_h, preserveAspectRatio=True, mask='auto')
            # move cursor below header with only bottom spacing
            y -= draw_h + 6*mm
        except Exception:
            # If image can't be read, just continue without it
            pass
    
    # INVOICE title as a full-width boxed row with light blue background
    title_table = Table([["INVOICE"]], colWidths=[width - 2*margin])
    title_table.setStyle(TableStyle([
        ("BOX", (0,0), (-1,-1), 0.8, colors.black),
        ("BACKGROUND", (0,0), (-1,-1), colors.lightblue),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("FONTNAME", (0,0), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 16),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ]))
    tw, th = title_table.wrapOn(c, width - 2*margin, 9999)
    title_table.drawOn(c, x0, y - th)
    y -= th + 10*mm

    # Top: split into two side-by-side tables (Customer info left, Invoice details right)
    # Left side fields
    left_rows_top = [
        ("Customer Code*", str(data["customer"].get("code",""))),
        ("Dealer Name*", data["customer"].get("dealer_name","")),
        ("Customer Name*", data["customer"].get("customer_name","")),
        ("Contact Number*", data["customer"].get("contact_number","")),
        ("Billing Address*", data["customer"].get("billing_address","")),
    ]
    # Right side fields
    right_rows_top = [
        ("Invoice #*", data.get("invoice_no","")),
        ("Date*", data.get("date", datetime.now().strftime("%d/%m/%Y"))),
        ("Shipping Address", data["customer"].get("shipping_address","")),
    ]

    total_inner_w = (width - 2*margin)
    top_gap = 4*mm  # space between the two top tables
    left_block_w_top = total_inner_w * 0.60
    right_block_w_top = total_inner_w - left_block_w_top - top_gap

    # Convert to 2-col rows with Paragraph formatting
    left_tbl_rows_top = [[p_txt(f"{k} :", small_bold), p_txt(v, small)] for k, v in left_rows_top]
    right_tbl_rows_top = [[p_txt(f"{k} :", small_bold), p_txt(v, small_right)] for k, v in right_rows_top]

    left_col_widths_top = [36*mm, left_block_w_top - 36*mm]
    right_col_widths_top = [26*mm, right_block_w_top - 26*mm]

    # Draw left and right tables, align heights
    top_h_left = draw_two_col_table(
        c, x0, y, left_block_w_top, left_col_widths_top, left_tbl_rows_top, pad=3*mm, bordered=True, grid=True
    )
    top_h_right = draw_two_col_table(
        c, x0 + left_block_w_top + top_gap, y, right_block_w_top, right_col_widths_top, right_tbl_rows_top, pad=3*mm, bordered=True, grid=True
    )
    y -= max(top_h_left, top_h_right) + 6*mm

    # Items table (same as your version)
    headers = ["Sl #", "Product Description", "Pkt Size", "Qty", "Unit Price", "Total Price"]
    table_data = [headers]
    total_ex_vat = 0.0
    for row in data["items"]:
        total = float(row["qty"]) * float(row["unit_price"])
        total_ex_vat += total
        table_data.append([
            str(row.get("sl","")),
            row.get("desc",""),
            str(row.get("pkt_size","")),
            str(row.get("qty","")),
            currency(row.get("unit_price","")),
            currency(total),
        ])

    col_widths_items = [14*mm, 90*mm, 20*mm, 16*mm, 22*mm, 24*mm]
    t_items = Table(table_data, colWidths=col_widths_items, repeatRows=1)
    t_items.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.lightblue),
        ("TEXTCOLOR", (0,0), (-1,0), colors.black),
        ("ALIGN", (0,0), (-1,0), "CENTER"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,0), 8),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("VALIGN", (0,1), (-1,-1), "MIDDLE"),
        ("FONTSIZE", (0,1), (-1,-1), 8),
        ("ALIGN", (3,1), (-1,-1), "RIGHT"),
        ("ALIGN", (0,1), (0,-1), "CENTER"),
        ("ALIGN", (2,1), (2,-1), "CENTER"),
    ]))
    tw, th = t_items.wrapOn(c, width - 2*margin, 160*mm)
    t_items.drawOn(c, x0, y - th)
    y -= th + 8*mm

    # Compute totals
    vat_pct = float(data.get("vat_percent", 15))
    vat_amount = round(total_ex_vat * vat_pct / 100.0, 2)
    total_incl_vat = total_ex_vat + vat_amount
    commission_pct = float(data.get("commission_percent", 0))
    commission_amt = round(total_ex_vat * commission_pct / 100.0, 2) if commission_pct else 0.0
    advance = float(data.get("advance", 0) or 0)
    previous_due = float(data.get("previous_due", 0) or 0)
    total_payable = round(total_incl_vat - commission_amt - advance + previous_due, 2)

    # Bottom left KV
    bank = data.get("bank", {})
    left_rows_bottom = [
        ("PO Reference*", data.get("po_reference","")),
        ("A/C Name*", bank.get("ac_name","")),
        ("A/C Number*", bank.get("ac_no","")),
        ("Bank Name*", bank.get("bank_name","")),
        ("Branch Name*", bank.get("branch_name","")),
        ("Routing Number*", bank.get("routing_number","")),
        ("In Word*", data.get("amount_in_words","")),
    ]

    # Bottom right (totals) as label/value lines; keep labels as given
    right_rows_bottom = [
        ("Total (Including VAT)*", currency(total_incl_vat)),
        (f"VAT @ {int(vat_pct)}%*", currency(vat_amount)),
        ("Total (Excluding VAT)*", currency(total_ex_vat)),
        ("Less:", ""),
        (f"i) Commission @ {int(commission_pct)}%*", currency(commission_amt) if commission_pct else ""),
        ("ii) Advance*", currency(advance) if advance else ""),
        ("Add:", ""),
        ("i) Previous Due*", currency(previous_due) if previous_due else ""),
        ("TOTAL PAYABLE* :", currency(total_payable)),
    ]

    # Bottom: split into two aligned tables where left (PO/bank) has only outer border
    # and right (totals) has borders. Ensure both have the same height.
    left_block_w = (width - 2*margin) * 0.60
    right_block_w = (width - 2*margin) - left_block_w

    left_tbl_rows_bottom = [[p_txt(f"{k} :", small_bold), p_txt(v, small)] for k, v in left_rows_bottom]
    right_tbl_rows_bottom = [[p_txt(f"{k}", small_bold), p_txt(v, small_right)] for k, v in right_rows_bottom]

    left_col_widths_bottom = [28*mm, left_block_w - 28*mm]
    right_col_widths_bottom = [46*mm, right_block_w - 46*mm]

    # First measure heights without drawing, to compute max height
    tmp_h_left = draw_two_col_table(
        c, x0, y, left_block_w, left_col_widths_bottom, left_tbl_rows_bottom,
        pad=3*mm, bordered=True, grid=False, measure_only=True
    )
    tmp_h_right = draw_two_col_table(
        c, x0 + left_block_w, y, right_block_w, right_col_widths_bottom, right_tbl_rows_bottom,
        pad=2*mm, bordered=True, grid=True, emphasize_last_right_value=True, measure_only=True
    )

    max_h = max(tmp_h_left, tmp_h_right)

    # Now draw with equalized heights, but avoid any filler row on the left bank table.
    # We will always force the RIGHT table to the max height. The left draws at its natural height.
    left_force = None
    right_force = max_h

    # Left (bank): outer border only, no inner grid; if we must force, ensure no accidental line above filler
    left_extra_style = []
    # No filler row on left, so no need for seam handling
    bottom_h_left = draw_two_col_table(
        c, x0, y, left_block_w, left_col_widths_bottom, left_tbl_rows_bottom,
        pad=3*mm, bordered=True, grid=False, force_total_height=left_force, extra_style=left_extra_style
    )

    # Right (totals): outer border only, draw selective horizontal lines to merge groups (no inner grid)
    # Keep lines below rows 0,1,2,5,7; remove between 3-4 and 6-7
    right_extra_style = [
        ("LINEBELOW", (0,0), (-1,0), 0.4, colors.grey),
        ("LINEBELOW", (0,1), (-1,1), 0.4, colors.grey),
        ("LINEBELOW", (0,2), (-1,2), 0.4, colors.grey),
        # merged block Less/Commission/Advance (rows 3-5): no line below 3 and 4, but line below 5
        ("LINEBELOW", (0,5), (-1,5), 0.4, colors.grey),
        # merged block Add:/Previous Due (rows 6-7): no line below 6, but line below 7
        ("LINEBELOW", (0,7), (-1,7), 0.4, colors.grey),
        # ensure absolutely no faint lines where we merge
        ("LINEBELOW", (0,3), (-1,3), 1, colors.white),
        ("LINEBELOW", (0,4), (-1,4), 1, colors.white),
        ("LINEBELOW", (0,6), (-1,6), 1, colors.white),
    ]
    bottom_h_right = draw_two_col_table(
        c, x0 + left_block_w, y, right_block_w, right_col_widths_bottom, right_tbl_rows_bottom,
        pad=2*mm, bordered=True, grid=False, emphasize_last_right_value=True,
        force_total_height=right_force, extra_style=right_extra_style
    )

    y -= max(bottom_h_left, bottom_h_right) + 10*mm

    # Signatures
    # Attempt to locate signature image in several common paths
    sign_candidates = []
    for fname in [
        "kamrul_sign.png",
        "karmul_sign.jpg",
        "karmul_signature.png",
        "karmul_signature.jpg",
    ]:
        sign_candidates.extend([
            os.path.join(script_dir, fname),
            os.path.join(script_dir, "assets", fname),
            os.path.join(os.path.dirname(script_dir), "assets", fname),
        ])
    sign_path = next((p for p in sign_candidates if os.path.exists(p)), None)

    # Compute right-side signature line bounds
    sig_line_left = A4[0] - margin - 60*mm
    sig_line_right = A4[0] - margin - 2*mm
    max_w = sig_line_right - sig_line_left

    # Draw signature image first (so text overlays are visible)
    if sign_path:
        try:
            sign_img = ImageReader(sign_path)
            s_w, s_h = sign_img.getSize()
            desired_h = 14*mm
            draw_w = desired_h * (s_w / s_h)
            draw_h = desired_h
            if draw_w > max_w:
                scale = max_w / draw_w
                draw_w *= scale
                draw_h *= scale
            x_img = sig_line_left + (max_w - draw_w) / 2.0
            y_img = 17*mm + 3*mm
            c.drawImage(sign_img, x_img, y_img, width=draw_w, height=draw_h, preserveAspectRatio=True, mask='auto')
        except Exception:
            pass

    # Then draw the labels and lines
    c.setFont("Helvetica", 8)
    c.drawString(margin+2*mm, 18*mm, "Customer Signature")
    c.line(margin+2*mm, 17*mm, margin+70*mm, 17*mm)

    c.drawRightString(A4[0] - margin - 60*mm, 18*mm, "Authorised Signature")
    c.line(A4[0] - margin - 60*mm, 17*mm, A4[0] - margin - 2*mm, 17*mm)

    c.showPage()
    c.save()

# ---------- SAMPLE RUN ----------
if __name__ == "__main__":
    sample_data = {
        "invoice_no": "ASK-AP# 04",
        "date": "9/11/2025",
        "customer": {
            "code": "1",
            "dealer_name": "ASK TRADE BRIDGE",
            "customer_name": "Marjanul Hassan",
            "contact_number": "017 1266 2292",
            "billing_address": "F Haque Tower, 107 CR Dutta Road, Panthapath, Dhaka-1205",
            "shipping_address": "F Haque Tower, 107 CR Dutta Road, Panthapath, Dhaka-1205",
        },
        "po_reference": "ASKTB-000001",
        "bank": {
            "ac_name": "ASK INTERNATIONAL",
            "ac_no": "7041-0212000820",
            "bank_name": "TRUST BANK LIMITED",
            "branch_name": "KAFRUL BRANCH",
            "routing_number": "240262387"
        },
        "items": [
            {"sl":1, "desc":"BMTF ELECTROLYTE DRINK ORANGE 225 ML", "pkt_size":"225 ML", "qty":24, "unit_price":40},
            {"sl":2, "desc":"BMTF ELECTROLYTE DRINK LEMON 225 ML", "pkt_size":"225 ML", "qty":24, "unit_price":40},
            {"sl":3, "desc":"GERMINOL DETERGENT POWDER REGULAR 400 GM", "pkt_size":"400 GM", "qty":1, "unit_price":130},
            {"sl":4, "desc":"GERMINOL DISHWASHING MAGIC BAR 300 GM", "pkt_size":"300 GM", "qty":1, "unit_price":32},
            {"sl":5, "desc":"BULLET BD ELECTROLYTE DRINKS ORANGE 250 ML", "pkt_size":"250 ML", "qty":1, "unit_price":37},
            {"sl":6, "desc":"BULLET BD ELECTROLYTE DRINKS LEMON 250 ML", "pkt_size":"250 ML", "qty":1, "unit_price":37},
            {"sl":7, "desc":"BMTF TASTY SALINE 20 PC", "pkt_size":"20 PC", "qty":1, "unit_price":1020},
            {"sl":8, "desc":"SIGNATURE SHAMPOO 400 ML", "pkt_size":"400 ML", "qty":1, "unit_price":375},
            {"sl":9, "desc":"GERMINOL HAND SANITIZER WITH DISPENSER PUMP 250 ML", "pkt_size":"250 ML", "qty":1, "unit_price":150},
            {"sl":10, "desc":"UP VET POWDER(20'S) 100 GM", "pkt_size":"100 GM", "qty":1, "unit_price":150},
        ],
        "vat_percent": 15,
        "commission_percent": 18,
        "advance": 0,
        "previous_due": 0,
        "amount_in_words": "Two Thousand Two Hundred Thirty Five Taka and Twenty Two Paisa Only",
    }

    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "output")
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, "invoice_sample.pdf")
    make_invoice_tables(sample_data, out_file)
    print(f"Invoice generated: {out_file}")
