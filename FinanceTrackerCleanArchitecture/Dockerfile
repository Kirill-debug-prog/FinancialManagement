FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["Core/Core.API/Core.API.csproj", "Core/Core.API/"]
COPY ["Core/Core.Domain/Core.Domain.csproj", "Core/Core.Domain/"]
COPY ["Core/Core.Infrastructure/Core.Infrastructure.csproj", "Core/Core.Infrastructure/"]
COPY ["Modules/Finance/Finance.Application/Finance.Application.csproj", "Modules/Finance/Finance.Application/"]
COPY ["Modules/Finance/Finance.Domain/Finance.Domain.csproj", "Modules/Finance/Finance.Domain/"]
COPY ["Modules/Finance/Finance.Infrastructure/Finance.Infrastructure.csproj", "Modules/Finance/Finance.Infrastructure/"]
COPY ["Modules/Reports/Reports.Application/Reports.Application.csproj", "Modules/Reports/Reports.Application/"]
COPY ["Modules/Reports/Reports.Domain/Reports.Domain.csproj", "Modules/Reports/Reports.Domain/"]
COPY ["Modules/Reports/Reports.Infrastructure/Reports.Infrastructure.csproj", "Modules/Reports/Reports.Infrastructure/"]
COPY ["Modules/Users/Users.Application/Users.Application.csproj", "Modules/Users/Users.Application/"]
COPY ["Modules/Users/Users.Domain/Users.Domain.csproj", "Modules/Users/Users.Domain/"]
COPY ["Modules/Users/Users.Infrastructure/Users.Infrastructure.csproj", "Modules/Users/Users.Infrastructure/"]

RUN dotnet restore "Core/Core.API/Core.API.csproj" -r linux-musl-x64

COPY . .
RUN dotnet publish "Core/Core.API/Core.API.csproj" \
    -c Release \
    -r linux-musl-x64 \
    --no-self-contained \
    --no-restore \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
RUN apk add --no-cache icu-libs
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Core.API.dll"]
