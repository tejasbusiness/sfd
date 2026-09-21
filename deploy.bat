@echo off
rem One-command production deploy. Double-click it, or run it from a terminal:
rem   deploy.bat              normal deploy (asks before touching production)
rem   deploy.bat -Yes         no prompts
rem   deploy.bat -UploadEnv   also upload the production .env
rem   deploy.bat -Migrate     apply pending database migrations
rem   deploy.bat -BuildOnly   validate, test and build only
rem   deploy.bat -VerifyOnly  only check the live site
rem   deploy.bat -Rollback    restore the previous static site
rem Details: deploy.md
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy.ps1" %*
set EXITCODE=%ERRORLEVEL%
rem Keep the window open when it was started by double-clicking.
echo %cmdcmdline% | find /i "deploy.bat" >nul && pause
exit /b %EXITCODE%
