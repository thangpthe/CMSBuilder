import argparse

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User


def main():
    parser = argparse.ArgumentParser(
        description="Tao tai khoan admin de demo tren may ca nhan."
    )
    parser.add_argument(
        "--reset-password",
        action="store_true",
        help="Dat lai mat khau demo_admin thanh demo123.",
    )
    args = parser.parse_args()

    username = "demo_admin"
    password = "demo123"

    with SessionLocal.begin() as db:
        existing = db.scalar(
            select(User).where(User.username == username)
        )

        if existing is None:
            db.add(
                User(
                    username=username,
                    hashed_password=get_password_hash(password),
                    role="system_admin",
                    is_active=True,
                )
            )
            message = "Da tao tai khoan demo_admin."
        elif args.reset_password:
            existing.hashed_password = get_password_hash(password)
            message = "Da cap nhat mat khau demo_admin."
        else:
            message = (
                "Tai khoan demo_admin da ton tai. "
                "Dung --reset-password de doi mat khau thanh demo123."
            )

    print(message)


if __name__ == "__main__":
    main()
