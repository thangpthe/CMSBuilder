
from logging.config import fileConfig

from alembic import context

from app.db.session import Base, DATABASE_URL, engine
import app.models


# Lay cau hinh Alembic
config = context.config

# Cau hinh logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Su dung Database URL cua Backend
config.set_main_option(
    "sqlalchemy.url",
    DATABASE_URL.replace("%", "%%")
)

# Nap metadata cua cac Model
target_metadata = Base.metadata


# Chay Migration o che do Offline
def run_migrations_offline():
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()


# Chay Migration o che do Online
def run_migrations_online():
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True
        )

        with context.begin_transaction():
            context.run_migrations()


# Lua chon che do Migration
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
