"""
Database management module for Hameed & Sons Bakery
Uses Python standard sqlite3 library for zero-dependency persistence.
Supports payment methods (COD vs Bank Transfer) and order status workflow.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "bakery.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite database tables and seeds default product menu."""
    conn = get_db()
    cursor = conn.cursor()

    # Create Orders Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            date_needed TEXT NOT NULL,
            category TEXT DEFAULT 'custom_cake',
            cake_size TEXT,
            flavor TEXT,
            frosting TEXT,
            inscription TEXT,
            estimated_price TEXT,
            payment_method TEXT DEFAULT 'Cash on Delivery',
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Ensure payment_method column exists in orders
    try:
        cursor.execute("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'Cash on Delivery'")
    except sqlite3.OperationalError:
        pass

    # Create Contact Inquiries Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            date_needed TEXT,
            category TEXT,
            message TEXT,
            payment_method TEXT DEFAULT 'Cash on Delivery',
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Ensure payment_method and status columns exist in inquiries
    try:
        cursor.execute("ALTER TABLE inquiries ADD COLUMN payment_method TEXT DEFAULT 'Cash on Delivery'")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE inquiries ADD COLUMN status TEXT DEFAULT 'Pending'")
    except sqlite3.OperationalError:
        pass

    # Create Products Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            price_pkr INTEGER NOT NULL,
            description TEXT,
            image_url TEXT,
            badge TEXT
        )
    """)

    # Seed Default Products if Table is Empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        default_products = [
            ("French Country Sourdough", "breads", 550, "Naturally fermented for 48 hours using wild yeast starter. Crispy, chewy crust with a light open crumb.", "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80", "Wild Yeast 48h"),
            ("Classic Butter Croissant", "pastries", 320, "Laminated with 100% Normandy butter for 36 honeycomb layers. Crispy outside, melt-in-your-mouth inside.", "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80", "100% Normandy Butter"),
            ("Red Velvet Cream Cheese", "cakes", 2200, "Moist crimson cocoa sponge layered with silky Philadelphia cream cheese and red velvet crumbs.", "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80", "Best Seller"),
            ("Fresh Blueberry Danish", "pastries", 380, "Crispy puff pastry nest loaded with rich vanilla bean pastry cream and topped with wild blueberries.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80", "Fresh Fruit"),
            ("Handcrafted Cafe Latte", "savory", 450, "Double shot of dark roast 100% Arabica espresso combined with velvety microfoam milk.", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80", "100% Arabica"),
            ("Chicken & Herb Quiche", "savory", 490, "Golden shortcrust pie shell packed with diced chicken breast, fresh thyme, cheddar cheese, and rich egg custard.", "https://images.unsplash.com/photo-1621236378699-8597faf6a176?auto=format&fit=crop&w=600&q=80", "Hot Oven Bake"),
            ("Multi-Grain Seeded Loaf", "breads", 480, "High fiber whole-grain bread encrusted with toasted sunflower, flax, chia, and sesame seeds.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80", "High Fiber"),
            ("Pistachio & Rose Water", "cakes", 2800, "Nutty pistachio sponge cake infused with organic rose water, white chocolate buttercream & rose petals.", "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80", "Signature Special")
        ]
        cursor.executemany("""
            INSERT INTO products (title, category, price_pkr, description, image_url, badge)
            VALUES (?, ?, ?, ?, ?, ?)
        """, default_products)

    conn.commit()
    conn.close()

def save_order(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO orders (customer_name, phone, date_needed, category, cake_size, flavor, frosting, inscription, estimated_price, payment_method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get('customer_name', 'Anonymous'),
        data.get('phone', 'N/A'),
        data.get('date_needed', 'N/A'),
        data.get('category', 'custom_cake'),
        data.get('cake_size', 'N/A'),
        data.get('flavor', 'N/A'),
        data.get('frosting', 'N/A'),
        data.get('inscription', ''),
        data.get('estimated_price', 'N/A'),
        data.get('payment_method', 'Cash on Delivery'),
        data.get('status', 'Pending')
    ))
    order_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return order_id

def save_inquiry(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO inquiries (customer_name, phone, date_needed, category, message, payment_method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get('customer_name', 'Anonymous'),
        data.get('phone', 'N/A'),
        data.get('date_needed', 'N/A'),
        data.get('category', 'General'),
        data.get('message', ''),
        data.get('payment_method', 'Cash on Delivery'),
        data.get('status', 'Pending')
    ))
    inquiry_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return inquiry_id

def update_order_status(order_id, new_status):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (new_status, order_id))
    conn.commit()
    conn.close()

def update_inquiry_status(inquiry_id, new_status):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE inquiries SET status = ? WHERE id = ?", (new_status, inquiry_id))
    conn.commit()
    conn.close()

def get_products():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products ORDER BY id ASC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def get_orders():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY id DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def get_inquiries():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inquiries ORDER BY id DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

if __name__ == "__main__":
    init_db()
    print("Database initialized with payment methods and order status support!")
