// FinanceProductCard.jsx
import React from "react";
import { Button } from "../button/button";
import { Badge } from "../badge/badge";
import { Progress } from "../progress/progress";
import "./FinanceProductCard.scss";

export default function FinanceProductCard({
    variant = "credit", // 'credit' | 'deposit'

    // common
    title = "",
    subtitle = "",
    typeLabel,
    statusBadge,

    // credit 
    remainingAmount = null,
    totalAmount = null,
    monthlyPayment = null,
    nextPaymentDate = null,

    // deposit props
    depositAmount = null,
    startDate = null,
    endDate = null,
    earnings = 0,

    interestRate = null,
    progress = 0,

    actions = [],
}) {
    const isCredit = variant === "credit";
    const isDeposit = variant === "deposit";

    const creditProgress =
        isCredit && totalAmount && remainingAmount != null
            ? ((totalAmount - remainingAmount) / totalAmount) * 100
            : 0;

    const effectiveProgress = isCredit ? creditProgress : (progress ?? 0);

    const fmt = (num) =>
        num == null ? "—" : Number(num).toLocaleString("ru-RU");

    const fmtDate = (date) =>
        !date ? "—" : new Date(date).toLocaleDateString("ru-RU");

    return (
        <div className={`finance-card finance-card--${variant}`}>
            <div className="finance-card__header">
                <div className="finance-card__header-left">
                    <h4 className="finance-card__title">{title}</h4>

                    {subtitle && (
                        <p className="finance-card__subtitle">{subtitle}</p>
                    )}

                    <div className="finance-card__badges">
                        {typeLabel && (
                            <Badge variant="outline">{typeLabel}</Badge>
                        )}
                        {statusBadge}
                    </div>
                </div>

                <div className="finance-card__amount">
                    {isCredit && remainingAmount != null && (
                        <>
                            <p className="finance-card__label">Осталось</p>
                            <p className="finance-card__value">
                                {fmt(remainingAmount)} ₽
                            </p>
                        </>
                    )}

                    {isDeposit && depositAmount != null && (
                        <>
                            <p className="finance-card__label">Сумма вклада</p>
                            <p className="finance-card__value">
                                {fmt(depositAmount)} ₽
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="finance-card__content">
                {isCredit && (
                    <div className="finance-card__progress">
                        <div className="finance-card__progress-info">
                            <span>Погашено {effectiveProgress.toFixed(1)}%</span>
                            {totalAmount != null && remainingAmount != null && (
                                <span>
                                    {(Number(totalAmount) - Number(remainingAmount)).toLocaleString("ru-RU")}{" "}
                                    из {Number(totalAmount).toLocaleString("ru-RU")} ₽
                                </span>
                            )}
                        </div>

                        <Progress className="finance-card__progress-bar" value={effectiveProgress} />
                    </div>
                )}

                <div className="finance-card__grid">
                    <div className="finance-card__column">
                        <p className="finance-card__label">Процентная ставка</p>
                        <p className="finance-card__value">
                            {interestRate != null ? `${interestRate}%` : "—"}
                        </p>
                    </div>

                    {isDeposit && (
                        <div className="finance-card__column">
                            <p className="finance-card__label">Ожидаемый доход</p>
                            <p className="finance-card__positive">
                                +{fmt(earnings)} ₽
                            </p>
                        </div>
                    )}

                    {isCredit && monthlyPayment != null && (
                        <div className="finance-card__column">
                            <p className="finance-card__label">Ежемесячно</p>
                            <p className="finance-card__value">
                                {fmt(monthlyPayment)} ₽
                            </p>
                        </div>
                    )}

                    {isDeposit && startDate && (
                        <div className="finance-card__column">
                            <p className="finance-card__label">Дата открытия</p>
                            <p className="finance-card__value">{fmtDate(startDate)}</p>
                        </div>
                    )}

                    {isDeposit && endDate && (
                        <div className="finance-card__column">
                            <p className="finance-card__label">Дата закрытия</p>
                            <p className="finance-card__value">{fmtDate(endDate)}</p>
                        </div>
                    )}

                    {isCredit && nextPaymentDate && (
                        <div className="finance-card__column">
                            <p className="finance-card__label">Следующий платёж</p>
                            <p className="finance-card__value">{fmtDate(nextPaymentDate)}</p>
                        </div>
                    )}

                    {isCredit && endDate && (
                        <div className="finance-card__column">
                            <p className="finance-card__label">Конец срока</p>
                            <p className="finance-card__value">{fmtDate(endDate)}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {actions && actions.length > 0 && (
                    <div className="finance-card__actions">
                        {actions.map((action, idx) => (
                            <Button
                                key={idx}
                                variant="white"
                                size="auto"
                                onClick={action.onClick}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
