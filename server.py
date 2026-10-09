"""
Python REST API & Static Server for Hameed & Sons Bakery
Runs on http://localhost:8000
Supports Payment Methods (COD / Bank Transfer) & Status Management (Pending -> Approved -> Paid -> Delivered)
"""

import http.server
import socketserver
import json
import os
import urllib.parse
from database import init_db, save_order, save_inquiry, get_products, get_orders, get_inquiries, update_order_status, update_inquiry_status

PORT = 8000
DIRECTORY = os.path.dirname(__file__)

class BakeryRequestHandler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _set_json_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_json_headers(200)

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)

        if parsed_path.path == '/api/products':
            products = get_products()
            self._set_json_headers(200)
            self.wfile.write(json.dumps({'status': 'success', 'data': products}).encode('utf-8'))
            return

        elif parsed_path.path == '/api/orders':
            orders = get_orders()
            self._set_json_headers(200)
            self.wfile.write(json.dumps({'status': 'success', 'data': orders}).encode('utf-8'))
            return

        elif parsed_path.path == '/api/inquiries':
            inquiries = get_inquiries()
            self._set_json_headers(200)
            self.wfile.write(json.dumps({'status': 'success', 'data': inquiries}).encode('utf-8'))
            return

        elif parsed_path.path == '/admin':
            orders = get_orders()
            inquiries = get_inquiries()

            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()

            def get_status_badge(status):
                status_str = status.lower() if status else 'pending'
                if 'delivered' in status_str:
                    return "<span style='background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:bold;'>📦 Delivered</span>"
                elif 'paid' in status_str:
                    return "<span style='background:#dcfce7;color:#166534;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:bold;'>🟢 Paid / Received</span>"
                elif 'approved' in status_str:
                    return "<span style='background:#e0e7ff;color:#3730a3;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:bold;'>🔵 Approved</span>"
                else:
                    return "<span style='background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:bold;'>🟡 Pending</span>"

            def get_pm_badge(pm):
                pm_str = pm.lower() if pm else 'cash'
                if 'bank' in pm_str or 'easypaisa' in pm_str or 'jazzcash' in pm_str:
                    return "<span style='background:#f3e8ff;color:#6b21a8;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:bold;'>🏦 Bank / EasyPaisa</span>"
                else:
                    return "<span style='background:#e0f2fe;color:#0369a1;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:bold;'>💵 Cash on Delivery</span>"

            # Pre-Order Inquiries Rows
            inquiries_rows = []
            for i in inquiries:
                btn_html = f"""
                <form action='/admin/update-status' method='POST' style='display:inline-block;'>
                    <input type='hidden' name='type' value='inquiry'>
                    <input type='hidden' name='id' value='{i["id"]}'>
                    <input type='hidden' name='status' value='Approved'>
                    <button type='submit' style='background:#3b82f6;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;margin-right:2px;'>Approve</button>
                </form>
                <form action='/admin/update-status' method='POST' style='display:inline-block;'>
                    <input type='hidden' name='type' value='inquiry'>
                    <input type='hidden' name='id' value='{i["id"]}'>
                    <input type='hidden' name='status' value='Paid'>
                    <button type='submit' style='background:#10b981;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;margin-right:2px;'>Mark Paid</button>
                </form>
                <form action='/admin/update-status' method='POST' style='display:inline-block;'>
                    <input type='hidden' name='type' value='inquiry'>
                    <input type='hidden' name='id' value='{i["id"]}'>
                    <input type='hidden' name='status' value='Delivered'>
                    <button type='submit' style='background:#6366f1;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;'>Delivered</button>
                </form>
                """
                inquiries_rows.append(
                    f"<tr><td style='padding:12px;border:1px solid #f3f4f6;'>#{i['id']}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'><b>{i['customer_name']}</b></td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'><a href='tel:{i['phone']}' style='color:#d97706;font-weight:bold;'>{i['phone']}</a></td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>{i['date_needed']}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>{get_pm_badge(i.get('payment_method'))}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>{i['message']}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>{get_status_badge(i.get('status', 'Pending'))}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>{btn_html}</td></tr>"
                )

            # Custom Cake Orders Rows
            orders_rows = []
            for o in orders:
                btn_html = f"""
                <form action='/admin/update-status' method='POST' style='display:inline-block;'>
                    <input type='hidden' name='type' value='order'>
                    <input type='hidden' name='id' value='{o["id"]}'>
                    <input type='hidden' name='status' value='Approved'>
                    <button type='submit' style='background:#3b82f6;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;margin-right:2px;'>Approve</button>
                </form>
                <form action='/admin/update-status' method='POST' style='display:inline-block;'>
                    <input type='hidden' name='type' value='order'>
                    <input type='hidden' name='id' value='{o["id"]}'>
                    <input type='hidden' name='status' value='Paid'>
                    <button type='submit' style='background:#10b981;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;margin-right:2px;'>Mark Paid</button>
                </form>
                <form action='/admin/update-status' method='POST' style='display:inline-block;'>
                    <input type='hidden' name='type' value='order'>
                    <input type='hidden' name='id' value='{o["id"]}'>
                    <input type='hidden' name='status' value='Delivered'>
                    <button type='submit' style='background:#6366f1;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;'>Delivered</button>
                </form>
                """
                orders_rows.append(
                    f"<tr><td style='padding:12px;border:1px solid #f3f4f6;'>#{o['id']}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'><b>{o['customer_name']}</b></td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'><a href='tel:{o['phone']}' style='color:#d97706;font-weight:bold;'>{o['phone']}</a></td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>{o['date_needed']}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>{get_pm_badge(o.get('payment_method'))}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>Size: {o['cake_size']} | Flavor: {o['flavor']}<br><i>Msg: {o['inscription']}</i></td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;font-weight:bold;color:#78350f;'>{o['estimated_price']}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>{get_status_badge(o.get('status', 'Pending'))}</td>"
                    f"<td style='padding:12px;border:1px solid #f3f4f6;'>{btn_html}</td></tr>"
                )

            html = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Admin Dashboard - Hameed & Sons Bakery</title>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fffdfa; margin: 0; padding: 25px; color: #292524; }}
                    .header {{ background: #451a03; color: white; padding: 20px 30px; border-radius: 16px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 25px -5px rgba(69,26,3,0.3); }}
                    .header h1 {{ margin: 0; font-size: 24px; }}
                    .card {{ background: white; border-radius: 16px; padding: 25px; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #fef3c7; }}
                    .card h2 {{ margin-top: 0; color: #78350f; border-bottom: 2px solid #fef3c7; padding-bottom: 12px; font-size: 20px; }}
                    table {{ width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }}
                    th {{ background: #78350f; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }}
                    tr:nth-child(even) {{ background-color: #fffdf9; }}
                    .badge {{ background: #d97706; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>Hameed & Sons Bakery - Admin Order Dashboard</h1>
                        <p style="margin:5px 0 0 0;font-size:13px;color:#fef3c7;">Location: Main Bazaar, Rakni, Balochistan | Helpline / WhatsApp: 03414565393</p>
                    </div>
                    <span class="badge">COD & Bank Transfer Enabled</span>
                </div>

                <div class="card">
                    <h2>🛒 Pre-Order Customer Inquiries ({len(inquiries)})</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Customer Name</th><th>Phone Number</th><th>Date Needed</th><th>Payment Method</th><th>Order Details</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {"".join(inquiries_rows) if inquiries_rows else "<tr><td colspan='8' style='padding:20px;text-align:center;color:#888;'>No customer pre-orders received yet.</td></tr>"}
                        </tbody>
                    </table>
                </div>

                <div class="card">
                    <h2>🎂 Custom Celebration Cake Orders ({len(orders)})</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Customer Name</th><th>Phone Number</th><th>Date Needed</th><th>Payment Method</th><th>Cake Specs</th><th>Price</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {"".join(orders_rows) if orders_rows else "<tr><td colspan='9' style='padding:20px;text-align:center;color:#888;'>No custom cake orders received yet.</td></tr>"}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html.encode('utf-8'))
            return

        # Serve static files
        return super().do_GET()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)

        # Handle Admin Status Change Form Submission
        if parsed_path.path == '/admin/update-status':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            params = urllib.parse.parse_qs(body)

            target_type = params.get('type', ['order'])[0]
            item_id = int(params.get('id', [0])[0])
            new_status = params.get('status', ['Pending'])[0]

            if target_type == 'inquiry':
                update_inquiry_status(item_id, new_status)
            else:
                update_order_status(item_id, new_status)

            self.send_response(303)
            self.send_header('Location', '/admin')
            self.end_headers()
            return

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        if parsed_path.path == '/api/orders':
            order_id = save_order(data)
            self._set_json_headers(201)
            response = {
                'status': 'success',
                'message': 'Custom cake order saved successfully!',
                'order_id': order_id
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        elif parsed_path.path == '/api/inquiries':
            inquiry_id = save_inquiry(data)
            self._set_json_headers(201)
            response = {
                'status': 'success',
                'message': 'Pre-order inquiry received successfully!',
                'inquiry_id': inquiry_id
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        elif parsed_path.path == '/api/update-status':
            target_type = data.get('type', 'order')
            item_id = data.get('id', 0)
            new_status = data.get('status', 'Approved')

            if target_type == 'inquiry':
                update_inquiry_status(item_id, new_status)
            else:
                update_order_status(item_id, new_status)

            self._set_json_headers(200)
            self.wfile.write(json.dumps({'status': 'success', 'message': f'Status updated to {new_status}'}).encode('utf-8'))
            return

        self._set_json_headers(404)
        self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode('utf-8'))


def main():
    init_db()
    with socketserver.TCPServer(("", PORT), BakeryRequestHandler) as httpd:
        print(f"Server started successfully at http://localhost:{PORT}")
        print(f"Admin Dashboard available at http://localhost:{PORT}/admin")
        print("Press Ctrl+C to stop server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Server stopped.")

if __name__ == "__main__":
    main()
