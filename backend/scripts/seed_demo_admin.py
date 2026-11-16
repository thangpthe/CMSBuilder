from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User


def main():
    username = "demo_admin"

    with SessionLocal.begin() as db:
        existing = db.scalar(select(User).where(User.username == username))
        if existing is not None:
            print("Tai khoan demo_admin da ton tai. Giu nguyen tai khoan.")
            return

        db.add(
            User(
                username=username,
                hashed_password=get_password_hash("CMSBuilder-Demo-2026"),
                role="system_admin",
                is_active=True,
            )
        )

    print("Da tao tai khoan demo_admin voi quyen system_admin.")


if __name__ == "__main__":
    main()
