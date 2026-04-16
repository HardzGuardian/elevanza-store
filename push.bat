@echo off
echo.
echo  Pushing to GitHub...
echo.

git add .
git status

echo.
set /p MSG="Enter commit message (or press Enter for 'update'): "
if "%MSG%"=="" set MSG=update

git commit -m "%MSG%"
git push origin master

echo.
echo  Done! Check your GitHub repo.
echo.
pause
