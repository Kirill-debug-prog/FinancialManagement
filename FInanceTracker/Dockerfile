FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

COPY FInanceTracker.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /output

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

RUN adduser --disabled-password --no-create-home appuser
USER appuser

COPY --from=build /output .

EXPOSE 8080

ENTRYPOINT ["dotnet", "FInanceTracker.dll"]
