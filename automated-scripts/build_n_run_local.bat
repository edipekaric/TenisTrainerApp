@echo off
echo =====================================
echo  Starting Full TenisTrainerApp Stack
echo =====================================

echo Moving to project root...
cd ..

echo Building and Starting Services...
docker-compose up --build

echo =====================================
echo        All services stopped.
echo =====================================

pause
