# المرحلة الأولى: البناء والترجمة
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
# ترجمة الكود ليصبح جاهزاً للإنتاج
RUN dotnet publish aspnet-core.csproj -c Release -o /app/publish

# المرحلة الثانية: التشغيل النهائي
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# المنفذ الافتراضي لدوت نت 8 داخل الدوكر
EXPOSE 8080

# تشغيل ملف المشروع (تأكد أن الاسم هنا يطابق اسم مشروعك)
ENTRYPOINT ["dotnet", "aspnet-core.dll"]