
import sys
from pathlib import Path
from getpass import getpass

from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError

# Them thu muc Backend vao Python path
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User


def main():

    print("=== CREATE CMSBUILDER USER ===")

    username = input("Username: ").strip()
    email = input("Email (bo trong neu khong co): ").strip()

    role = input(
        "Role (system_admin/page_admin) [page_admin]: "
    ).strip().lower()

    if not role:
        role = "page_admin"

    if not username:
        print("Username khong duoc de trong.")
        return

    if role not in {"system_admin", "page_admin"}:
        print("Role khong hop le.")
        return

    password = getpass("Password: ")
    confirm_password = getpass("Confirm password: ")

    if not password:
        print("Password khong duoc de trong.")
        return

    if password != confirm_password:
        print("Hai mat khau khong trung khop.")
        return

    db = SessionLocal()

    try:

        # Kiem tra username hoac email da ton tai
        conditions = [User.username == username]

        if email:
            conditions.append(User.email == email)

        existing_user = db.scalar(
            select(User).where(or_(*conditions))
        )

        if existing_user:
            print("Username hoac email da ton tai.")
            return

        # Hash mat khau
        hashed_password = get_password_hash(password)

        # Tao User moi
        new_user = User(
            username=username,
            email=email or None,
            hashed_password=hashed_password,
            role=role,
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print("\nTao tai khoan thanh cong!")
        print("User ID:", new_user.id)
        print("Username:", new_user.username)
        print("Role:", new_user.role)

    except IntegrityError:
        db.rollback()
        print("Khong the tao tai khoan do du lieu trung lap.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
