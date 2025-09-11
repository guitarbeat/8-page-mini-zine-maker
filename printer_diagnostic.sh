#!/bin/bash

echo "=== Printer Diagnostic Script ==="
echo "Date: $(date)"
echo

echo "1. Checking CUPS service status:"
if systemctl is-active --quiet cups; then
    echo "✓ CUPS is running"
else
    echo "✗ CUPS is not running"
    echo "Starting CUPS..."
    sudo systemctl start cups
fi
echo

echo "2. Checking available printers:"
if command -v lpstat >/dev/null 2>&1; then
    lpstat -p 2>/dev/null || echo "No printers found or lpstat failed"
else
    echo "lpstat not available - CUPS may not be properly installed"
fi
echo

echo "3. Checking CUPS logs for errors:"
if [ -f /var/log/cups/error_log ]; then
    echo "Recent CUPS errors:"
    sudo tail -5 /var/log/cups/error_log 2>/dev/null || echo "Cannot access CUPS logs"
else
    echo "CUPS error log not found"
fi
echo

echo "4. Checking system resources:"
echo "Available memory:"
free -h | grep -E "(Mem|Swap)"
echo
echo "Disk space:"
df -h | grep -E "(/$|/var)"
echo

echo "5. Checking for printer-related packages:"
dpkg -l | grep -E "(cups|print|hplip)" | head -10
echo

echo "6. Testing basic print capability:"
if command -v lp >/dev/null 2>&1; then
    echo "Testing print command..."
    echo "Test print from diagnostic script" | lp 2>&1 || echo "Print test failed"
else
    echo "lp command not available"
fi
echo

echo "=== Diagnostic Complete ==="
echo "If you're still experiencing issues, try:"
echo "1. Convert your document to PDF first"
echo "2. Update printer drivers"
echo "3. Check printer memory/buffer settings"
echo "4. Try printing from a different application"