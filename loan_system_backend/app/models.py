from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Dict, Any

from sqlalchemy import (
    String, Integer, Float, DateTime, ForeignKey, Text, JSON, func
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# =========================
# USERS
# =========================
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="ANALYST", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Optional: if you want reverse lookup of decisions by analyst:
    decisions: Mapped[List["Decision"]] = relationship(
        back_populates="analyst",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# CLIENTS
# =========================
class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    account: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(180), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # ACTIVE / SUSPENDED / CLOSED
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)

    # ✅ FIX: one-to-one financials
    financials: Mapped[Optional["ClientFinancial"]] = relationship(
        "ClientFinancial",
        back_populates="client",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    # ✅ NEW: one client -> many loan applications
    applications: Mapped[List["LoanApplication"]] = relationship(
        "LoanApplication",
        back_populates="client",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class ClientFinancial(Base):
    __tablename__ = "client_financials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    client_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    outstanding: Mapped[float] = mapped_column(Float, default=0)
    payment_plan: Mapped[float] = mapped_column(Float, default=0)
    remaining_period: Mapped[float] = mapped_column(Float, default=0)
    periodicity: Mapped[float] = mapped_column(Float, default=0)
    class_value: Mapped[float] = mapped_column(Float, default=0)
    compulsory_saving: Mapped[float] = mapped_column(Float, default=0)
    voluntary_saving: Mapped[float] = mapped_column(Float, default=0)
    salary: Mapped[float] = mapped_column(Float, default=0)
    duration: Mapped[float] = mapped_column(Float, default=0)
    start_date: Mapped[str] = mapped_column(String(30), default="")

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # ✅ matches Client.financials
    client: Mapped["Client"] = relationship("Client", back_populates="financials")


# =========================
# LOAN APPLICATIONS
# =========================
class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    client_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    amount_requested: Mapped[float] = mapped_column(Float, default=0)
    purpose: Mapped[str] = mapped_column(String(120), default="")
    term_requested: Mapped[int] = mapped_column(Integer, default=0)

    status: Mapped[str] = mapped_column(String(20), default="SUBMITTED")
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ✅ back_populates links to Client.applications
    client: Mapped["Client"] = relationship("Client", back_populates="applications")

    # ✅ one-to-many score history
    scores: Mapped[List["CreditScore"]] = relationship(
        "CreditScore",
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    # ✅ decision history
    decisions: Mapped[List["Decision"]] = relationship(
        "Decision",
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# MODEL SCORES
# =========================
class CreditScore(Base):
    __tablename__ = "credit_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    application_id: Mapped[int] = mapped_column(
        ForeignKey("loan_applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    probability_default: Mapped[float] = mapped_column(Float, nullable=False)
    credit_score: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_band: Mapped[str] = mapped_column(String(40), nullable=False)
    decision_suggestion: Mapped[str] = mapped_column(String(20), nullable=False)

    top_factors: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)

    model_version: Mapped[str] = mapped_column(String(40), default="v1")
    scored_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    application: Mapped["LoanApplication"] = relationship(
        "LoanApplication",
        back_populates="scores"
    )


# =========================
# HUMAN DECISIONS
# =========================
class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    application_id: Mapped[int] = mapped_column(
        ForeignKey("loan_applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    analyst_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    final_decision: Mapped[str] = mapped_column(String(20), nullable=False)
    comment: Mapped[str] = mapped_column(Text, default="")

    decided_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    application: Mapped["LoanApplication"] = relationship(
        "LoanApplication",
        back_populates="decisions"
    )

    analyst: Mapped["User"] = relationship(
        "User",
        back_populates="decisions"
    )