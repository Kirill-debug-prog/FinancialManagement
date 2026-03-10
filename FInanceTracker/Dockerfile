FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

COPY FInanceTracker.csproj .

RUN dotnet restore "FInanceTracker.csproj"

COPY . .

RUN dotnet publish "FInanceTracker.csproj" -c Release -o /output

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=build /output .

EXPOSE 8080

ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "FInanceTracker.dll"]