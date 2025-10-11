# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy project file and restore dependencies for the specific runtime
COPY WebApi.csproj .
RUN dotnet restore --runtime linux-musl-x64

# Copy source and build
COPY . .
RUN dotnet publish -c Release -o /app/publish \
    --no-restore \
    --runtime linux-musl-x64 \
    --self-contained false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -s /bin/sh -D appuser

# Copy published app
COPY --from=build /app/publish .

# Set ownership
RUN chown -R appuser:appuser /app
USER appuser

# Fly.io provides HTTPS termination, so we only need HTTP
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "WebApi.dll"]
