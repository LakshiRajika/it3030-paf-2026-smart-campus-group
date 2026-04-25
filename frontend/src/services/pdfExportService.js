import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

class PDFExportService {
    
    // Export tickets table as PDF
    static async exportTicketsToPDF(tickets, title = 'Ticket Report') {
        // Create a temporary div for rendering
        const printDiv = document.createElement('div');
        printDiv.style.position = 'absolute';
        printDiv.style.left = '-9999px';
        printDiv.style.top = '0';
        printDiv.style.width = '1200px';
        printDiv.style.backgroundColor = 'white';
        printDiv.style.padding = '40px';
        printDiv.style.fontFamily = 'Arial, sans-serif';
        
        // Build HTML content
        printDiv.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .title { font-size: 24px; font-weight: bold; color: #1e293b; }
                    .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
                    .date { font-size: 12px; color: #94a3b8; margin-top: 10px; }
                    .stats-grid { display: flex; gap: 20px; margin-bottom: 30px; }
                    .stat-card { flex: 1; background: #f8fafc; padding: 15px; border-radius: 12px; text-align: center; }
                    .stat-value { font-size: 28px; font-weight: bold; color: #1e293b; }
                    .stat-label { font-size: 12px; color: #64748b; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 12px; font-weight: bold; color: #475569; border-bottom: 2px solid #e2e8f0; }
                    td { padding: 10px 12px; font-size: 11px; color: #334155; border-bottom: 1px solid #e2e8f0; }
                    .status-badge { display: inline-block; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: bold; }
                    .status-OPEN { background: #fef3c7; color: #d97706; }
                    .status-IN_PROGRESS { background: #dbeafe; color: #2563eb; }
                    .status-RESOLVED { background: #d1fae5; color: #059669; }
                    .status-CLOSED { background: #f1f5f9; color: #475569; }
                    .priority-CRITICAL { background: #fee2e2; color: #dc2626; }
                    .priority-HIGH { background: #ffedd5; color: #ea580c; }
                    .priority-MEDIUM { background: #fef08a; color: #ca8a04; }
                    .priority-LOW { background: #e0e7ff; color: #4f46e5; }
                    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">Smart Campus Operations Hub</div>
                    <div class="subtitle">${title}</div>
                    <div class="date">Generated on: ${new Date().toLocaleString()}</div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${tickets.length}</div>
                        <div class="stat-label">Total Tickets</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}</div>
                        <div class="stat-label">Active Tickets</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}</div>
                        <div class="stat-label">Resolved Tickets</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Location</th>
                            <th>Description</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Created By</th>
                            <th>Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tickets.map(ticket => `
                            <tr>
                                <td>${(ticket.id || '').substring(0, 8)}</td>
                                <td>${ticket.location || 'N/A'}</td>
                                <td>${(ticket.description || '').substring(0, 60)}${ticket.description?.length > 60 ? '...' : ''}</td>
                                <td><span class="priority-${ticket.priority}">${ticket.priority}</span></td>
                                <td><span class="status-${ticket.status}">${(ticket.status || '').replace('_', ' ')}</span></td>
                                <td>${ticket.createdByName || (ticket.createdById || '').substring(0, 8) || 'Anonymous'}</td>
                                <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Smart Campus Operations Hub - Official Ticket Report</p>
                    <p>This report is system-generated and contains real-time data from the campus management system.</p>
                </div>
            </body>
            </html>
        `;
        
        document.body.appendChild(printDiv);
        
        try {
            const canvas = await html2canvas(printDiv, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 297; // A4 landscape width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`ticket_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
            throw error;
        } finally {
            document.body.removeChild(printDiv);
        }
    }
    
    // Export single ticket details as PDF
    static async exportSingleTicketToPDF(ticket, comments = []) {
        const printDiv = document.createElement('div');
        printDiv.style.position = 'absolute';
        printDiv.style.left = '-9999px';
        printDiv.style.top = '0';
        printDiv.style.width = '800px';
        printDiv.style.backgroundColor = 'white';
        printDiv.style.padding = '40px';
        printDiv.style.fontFamily = 'Arial, sans-serif';
        
        printDiv.innerHTML = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                    .title { font-size: 24px; font-weight: bold; color: #1e293b; }
                    .ticket-id { font-size: 12px; color: #64748b; margin-top: 5px; }
                    .section { margin-bottom: 20px; }
                    .section-title { font-size: 16px; font-weight: bold; color: #1e293b; border-left: 3px solid #4f46e5; padding-left: 10px; margin-bottom: 15px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; background: #f8fafc; padding: 15px; border-radius: 8px; }
                    .info-label { font-weight: bold; color: #475569; font-size: 12px; }
                    .info-value { color: #334155; font-size: 12px; }
                    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                    .timeline { margin-top: 20px; }
                    .timeline-item { display: flex; gap: 15px; margin-bottom: 15px; }
                    .timeline-dot { width: 10px; height: 10px; background: #4f46e5; border-radius: 50%; margin-top: 5px; }
                    .timeline-content { flex: 1; background: #f8fafc; padding: 10px; border-radius: 8px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">Ticket Details Report</div>
                    <div class="ticket-id">Ticket ID: ${ticket.id}</div>
                </div>
                
                <div class="section">
                    <div class="section-title">Ticket Information</div>
                    <div class="info-grid">
                        <div class="info-label">Location:</div>
                        <div class="info-value">${ticket.location || 'N/A'}</div>
                        <div class="info-label">Category:</div>
                        <div class="info-value">${ticket.category || 'N/A'}</div>
                        <div class="info-label">Priority:</div>
                        <div class="info-value"><span class="status-badge priority-${ticket.priority}">${ticket.priority}</span></div>
                        <div class="info-label">Status:</div>
                        <div class="info-value"><span class="status-badge status-${ticket.status}">${ticket.status}</span></div>
                        <div class="info-label">Created By:</div>
                        <div class="info-value">${ticket.createdByName || 'Anonymous'}</div>
                        <div class="info-label">Created Date:</div>
                        <div class="info-value">${new Date(ticket.createdAt).toLocaleString()}</div>
                        ${ticket.resolvedAt ? `<div class="info-label">Resolved Date:</div><div class="info-value">${new Date(ticket.resolvedAt).toLocaleString()}</div>` : ''}
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Description</div>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                        <p style="margin: 0; font-size: 12px; line-height: 1.5;">${ticket.description}</p>
                    </div>
                </div>
                
                ${ticket.resolutionNotes ? `
                <div class="section">
                    <div class="section-title">Resolution Notes</div>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                        <p style="margin: 0; font-size: 12px; line-height: 1.5;">${ticket.resolutionNotes}</p>
                    </div>
                </div>
                ` : ''}
                
                ${comments.length > 0 ? `
                <div class="section">
                    <div class="section-title">Comments (${comments.length})</div>
                    ${comments.map(comment => `
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <div style="font-weight: bold; font-size: 11px; color: #4f46e5;">${comment.authorName}</div>
                                <div style="font-size: 11px; color: #64748b; margin-bottom: 5px;">${new Date(comment.createdAt).toLocaleString()}</div>
                                <div style="font-size: 11px; color: #334155;">${comment.content}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <div class="footer">
                    <p>Smart Campus Operations Hub - Official Ticket Report</p>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `;
        
        document.body.appendChild(printDiv);
        
        try {
            const canvas = await html2canvas(printDiv, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('portrait', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`ticket_${ticket.id.substring(0, 8)}_report.pdf`);
        } finally {
            document.body.removeChild(printDiv);
        }
    }
    
    // Export analytics dashboard as PDF
    static async exportAnalyticsToPDF(analyticsData, chartsRef) {
        const printDiv = document.createElement('div');
        printDiv.style.position = 'absolute';
        printDiv.style.left = '-9999px';
        printDiv.style.top = '0';
        printDiv.style.width = '1200px';
        printDiv.style.backgroundColor = 'white';
        printDiv.style.padding = '40px';
        
        // Capture charts as images
        let chartImages = [];
        if (chartsRef.current) {
            // Filter out null refs if any
            const activeCharts = chartsRef.current.filter(el => el !== null);
            for (const chart of activeCharts) {
                try {
                    const canvas = await html2canvas(chart, { scale: 2 });
                    chartImages.push(canvas.toDataURL('image/png'));
                } catch (e) {
                    console.error('Chart capture failed:', e);
                }
            }
        }
        
        printDiv.innerHTML = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .title { font-size: 24px; font-weight: bold; color: #1e293b; }
                    .stats { display: flex; gap: 20px; margin-bottom: 30px; }
                    .stat { flex: 1; background: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; }
                    .stat-value { font-size: 28px; font-weight: bold; }
                    h3 { margin: 20px 0 10px 0; }
                    img { width: 100%; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">Campus Analytics Report</div>
                    <div>Generated: ${new Date().toLocaleString()}</div>
                </div>
                <div class="stats">
                    <div class="stat"><div class="stat-value">${analyticsData.totalTickets || 0}</div><div>Total Tickets</div></div>
                    <div class="stat"><div class="stat-value">${analyticsData.avgResolutionTimeHours?.toFixed(1) || 0}h</div><div>Avg Resolution</div></div>
                </div>
                ${chartImages.map(img => `<img src="${img}" />`).join('')}
            </body>
            </html>
        `;
        
        document.body.appendChild(printDiv);
        const canvas = await html2canvas(printDiv, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`analytics_report_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.removeChild(printDiv);
    }
}

export default PDFExportService;
