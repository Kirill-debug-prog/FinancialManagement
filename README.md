````md
# Frontend API Contract

Документация описывает, какие endpoint, request/response модели и форматы ожидает frontend.

---

# Base URL

```env
VITE_API_URL=https://domain.com/api
```

Fallback:

```http
/api
```

---

# Authentication

## JWT Bearer Token

Frontend автоматически отправляет:

```http
Authorization: Bearer <jwt>
```

---

## JWT payload

Frontend ожидает userId в одном из полей:

```json
{
  "sub": "user-id"
}
```

или:

```json
{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "user-id"
}
```

---

## Unauthorized

При `401` frontend:

- очищает localStorage
- редиректит пользователя на `/login`

---

# Auth API

## Login

### Request

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "test@test.com",
  "password": "123456"
}
```

### Response

```json
{
  "token": "jwt-token"
}
```

---

## Register

### Request

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "email": "test@test.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

### Response

```json
{
  "id": "uuid",
  "email": "test@test.com"
}
```

---

# Profiles API

## Get profiles

```http
GET /profiles
```

### Response

```json
[
  {
    "id": "uuid",
    "name": "Основной",
    "mainCurrency": "RUB"
  }
]
```

---

## Get profile

```http
GET /profiles/{profileId}
```

### Response

```json
{
  "id": "uuid",
  "name": "Основной",
  "mainCurrency": "RUB"
}
```

---

## Create profile

```http
POST /profiles
```

### Request

```json
{
  "name": "Основной",
  "mainCurrency": "RUB"
}
```

### Response

```json
{
  "id": "uuid",
  "name": "Основной",
  "mainCurrency": "RUB"
}
```

---

## Update profile

```http
PUT /profiles/{profileId}
```

### Request

```json
{
  "name": "Новый профиль"
}
```

---

## Delete profile

```http
DELETE /profiles/{profileId}
```

### Response

```http
204 No Content
```

---

# Profile scoped endpoints

Все остальные endpoint:

```http
/profiles/{profileId}/...
```

---

# Accounts API

## Account model

```json
{
  "id": "uuid",
  "name": "Тинькофф",
  "currencyCode": "RUB",
  "currencyShortName": "₽",
  "balance": 1000.5,
  "icon": "card",
  "isArchived": false
}
```

---

## Get accounts

```http
GET /profiles/{profileId}/accounts
```

### Response

```json
[
  {
    "id": "uuid",
    "name": "Карта",
    "currencyCode": "RUB",
    "currencyShortName": "₽",
    "balance": 1000,
    "icon": "card",
    "isArchived": false
  }
]
```

---

## Get account

```http
GET /profiles/{profileId}/accounts/{id}
```

---

## Create account

```http
POST /profiles/{profileId}/accounts
```

### Request

```json
{
  "name": "Карта",
  "type": "card",
  "currency": "RUB",
  "balance": 1000,
  "color": "#10b981",
  "icon": "card"
}
```

---

## Update account

```http
PUT /profiles/{profileId}/accounts/{id}
```

---

## Delete account

```http
DELETE /profiles/{profileId}/accounts/{id}
```

---

## Archive account

```http
POST /profiles/{profileId}/accounts/{id}/archive
```

---

# Categories API

## Category model

```json
{
  "id": "uuid",
  "name": "Продукты",
  "type": "Expense",
  "parentId": null,
  "subcategories": []
}
```

---

## Get categories

```http
GET /profiles/{profileId}/categories?type=Expense
```

### Query params

| Param | Type   | Description      |
| ----- | ------ | ---------------- |
| type  | string | Expense / Income |

---

## Create category

```http
POST /profiles/{profileId}/categories
```

### Request

```json
{
  "name": "Продукты",
  "type": "Expense",
  "icon": "🛒",
  "color": "#ef4444",
  "parentId": null
}
```

---

# Transactions API

## Transaction model

```json
{
  "id": "uuid",
  "date": "2026-05-12T12:00:00Z",
  "type": "Expense",
  "categoryName": "Продукты",
  "categoryId": "uuid",
  "accountName": "Тинькофф",
  "accountId": "uuid",
  "totalAmount": 1500,
  "note": "Пятерочка",
  "currencyCode": "RUB",
  "currencyId": "uuid"
}
```

---

## Get transactions

```http
GET /profiles/{profileId}/transactions
```

### Query params

| Param      | Type     |
| ---------- | -------- |
| accountId  | string   |
| categoryId | string   |
| dateFrom   | ISO date |
| dateTo     | ISO date |

### Example

```http
GET /profiles/{profileId}/transactions?dateFrom=2026-01-01&dateTo=2026-12-31
```

---

## Create transaction

```http
POST /profiles/{profileId}/transactions
```

### Request

```json
{
  "accountId": "uuid",
  "categoryId": "uuid",
  "amount": 1500,
  "date": "2026-05-12T12:00:00Z",
  "type": "Expense",
  "note": "Пятерочка"
}
```

---

# Currencies API

## Currency model

```json
{
  "id": "uuid",
  "code": "RUB",
  "symbol": "₽",
  "name": "Российский рубль",
  "exchangeRate": 1
}
```

---

# Credits API

## Credit model

```json
{
  "id": "uuid",
  "lender": "Сбербанк",
  "amount": 500000,
  "rate": 12.5,
  "startDate": "2026-01-01",
  "endDate": "2030-01-01",
  "description": "",
  "currencyCode": "RUB"
}
```

---

# Debts API

## Debt model

```json
{
  "id": "uuid",
  "debtor": "Иван",
  "amount": 10000,
  "reason": "Долг",
  "dueDate": "2026-06-01",
  "description": "",
  "currencyCode": "RUB"
}
```

---

# Deposits API

## Deposit model

```json
{
  "id": "uuid",
  "bank": "Тинькофф",
  "amount": 100000,
  "rate": 8.5,
  "startDate": "2026-01-01",
  "endDate": "2027-01-01",
  "currencyCode": "RUB",
  "description": ""
}
```

---

# Reports API

## Monthly report

```http
GET /profiles/{profileId}/reports/monthly?year=2026
```

### Response

```json
{
  "months": [
    {
      "month": 1,
      "income": 100000,
      "expense": 70000
    }
  ]
}
```

---

## Categories report

```http
GET /profiles/{profileId}/reports/categories
```

### Query params

| Param    | Type             |
| -------- | ---------------- |
| type     | Expense / Income |
| dateFrom | ISO date         |
| dateTo   | ISO date         |

### Response

```json
{
  "categories": [
    {
      "categoryId": "uuid",
      "categoryName": "Продукты",
      "amount": 25000
    }
  ]
}
```

---

# Dashboard API

## Get dashboard

```http
GET /profiles/{profileId}/dashboard
```

### Response

```json
{
  "accounts": [],
  "recentTransactions": [],
  "totals": {
    "balance": 100000,
    "income": 150000,
    "expense": 50000
  }
}
```

---

# Error format

Frontend ожидает:

```json
{
  "message": "Текст ошибки"
}
```

Иначе покажется generic error:

```text
Ошибка сервера
```

---

# HTTP statuses

| Status | Meaning          |
| ------ | ---------------- |
| 200    | OK               |
| 201    | Created          |
| 204    | No Content       |
| 400    | Validation error |
| 401    | Unauthorized     |
| 404    | Not found        |
| 500    | Server error     |

---

# Important notes

## 1. Поля критичны по названию

Например:

✅ Правильно:

```json
{
  "currencyCode": "RUB"
}
```

❌ Неправильно:

```json
{
  "currency": "RUB"
}
```

Frontend использует transformers:

- `transformAccountFromBackend`
- `transformTransactionFromBackend`
- `transformCategoryFromBackend`
- и т.д.

---

## 2. Nullable values

Желательно всегда возвращать:

- строки → `""`
- массивы → `[]`
- числа → `0`

Некоторые части frontend не защищены от `undefined`.

---

## 3. Date format

Frontend ожидает ISO даты:

```json
{
  "date": "2026-05-12T12:00:00Z"
}
```

---

## 4. DELETE responses

Рекомендуемый ответ:

```http
204 No Content
```

---

## 5. Query params

Frontend НЕ отправляет пустые query параметры.

✅ Правильно:

```http
/categories?type=Expense
```

❌ Неправильно:

```http
/categories?type=
```
````
