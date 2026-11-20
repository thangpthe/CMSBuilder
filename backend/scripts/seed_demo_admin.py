import argparse
import sys
from pathlib import Path

from sqlalchemy import select

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User

SEED_USERS = (
    ("demo_admin", "demo123", "system_admin"),
    ("page_admin", "demo123", "page_admin"),
)


def main():
    parser = argparse.ArgumentParser(
        description="Tao cac tai khoan demo (demo_admin va page_admin) tren may ca nhan."
    )
    parser.add_argument(
        "--reset-password",
        action="store_true",
        help="Dat lai mat khau cua demo_admin va page_admin thanh demo123.",
    )
    args = parser.parse_args()

    messages: list[str] = []

    with SessionLocal.begin() as db:
        for username, password, role in SEED_USERS:
            existing = db.scalar(
                select(User).where(User.username == username)
            )

            if existing is None:
                db.add(
                    User(
                        username=username,
                        hashed_password=get_password_hash(password),
                        role=role,
                        is_active=True,
                    )
                )
                messages.append(f"Da tao tai khoan {username} ({role}).")
            elif args.reset_password:
                existing.hashed_password = get_password_hash(password)
                existing.is_active = True
                messages.append(
                    f"Da cap nhat mat khau {username} ({existing.role})."
                )
            else:
                messages.append(
                    f"Tai khoan {username} ({existing.role}) da ton tai. "
                    f"Dung --reset-password de doi mat khau thanh {password}."
                )

    for message in messages:
        print(message)


if __name__ == "__main__":
    main()
