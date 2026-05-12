import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Brain, ChevronDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

const modelLabels = {
  gpt_5_mini: 'GPT-5 Mini',
  gemini_3_flash: 'Gemini 3 Flash',
  gpt_5_4: 'GPT-5.4',
  claude_sonnet_4_6: 'Claude Sonnet',
  claude_opus_4_6: 'Claude Opus',
};

function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function drawDivider(doc, y, color = [220, 220, 230]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  return y + 6;
}

function drawSection(doc, title, y) {
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFillColor(99, 102, 241, 0.08);
  doc.roundedRect(18, y - 5, 174, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(99, 102, 241);
  doc.text(title.toUpperCase(), 22, y + 2);
  doc.setTextColor(30, 30, 40);
  return y + 12;
}

export default function ExportPDFButton({ face, knowledgeItems, feedbackEntries }) {
  const [loading, setLoading] = useState(false);

  const buildPDF = (includeFiles) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 20;
    const textW = pageW - margin * 2;
    let y = 0;

    // ── COVER ──────────────────────────────────────────
    doc.setFillColor(15, 15, 30);
    doc.rect(0, 0, 210, 297, 'F');

    // Gradient overlay strip
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 5, 297, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('AIFaces', 20, 50);

    doc.setFontSize(14);
    doc.setTextColor(160, 160, 220);
    doc.text('Knowledge report', 20, 62);

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(face.name, 20, 100);

    doc.setFontSize(10);
    doc.setTextColor(130, 130, 180);
    doc.text(`Model: ${modelLabels[face.model] || face.model}`, 20, 113);
    doc.text(`Generated: ${format(new Date(), "d. MMMM yyyy 'at' HH:mm")}`, 20, 121);

    // Stats row
    const stats = [
      { label: 'Messages', value: face.total_messages || 0 },
      { label: 'Files', value: face.total_files || 0 },
      { label: 'Feedbacks', value: feedbackEntries.length },
    ];
    stats.forEach((s, i) => {
      const sx = 20 + i * 60;
      doc.setFillColor(30, 30, 55);
      doc.roundedRect(sx, 145, 52, 28, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(String(s.value), sx + 8, 158);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 180);
      doc.text(s.label, sx + 8, 166);
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 120);
    doc.text('Exported from SnapTrainer', 20, 287);

    // ── PAGE 2: CONTENT ────────────────────────────────
    doc.addPage();
    doc.setFillColor(252, 252, 255);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 5, 297, 'F');

    y = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 15, 30);
    doc.text(face.name, margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 150);
    doc.text(`${modelLabels[face.model] || face.model}  ·  ${format(new Date(), 'd. MMM yyyy')}`, margin, y);
    y += 10;
    y = drawDivider(doc, y);

    // Identity / style preferences
    if (face.style_preferences && Object.keys(face.style_preferences).length > 0) {
      y = drawSection(doc, 'Style preferences', y);
      const prefs = face.style_preferences;
      const rows = [
        ['Tone', prefs.tone || '—'],
        ['Language', prefs.language || '-'],
        ['Detail level', prefs.verbosity || '-'],
        ['Formality', prefs.formality || '-'],
      ];
      rows.forEach(([key, val]) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 80);
        doc.text(key + ':', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 40);
        doc.text(val, margin + 30, y);
        y += 7;
      });
      y += 4;
      y = drawDivider(doc, y);
    }

    // Knowledge summary
    if (face.knowledge_summary) {
      y = drawSection(doc, 'Knowledge summary', y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 60);
      y = addWrappedText(doc, face.knowledge_summary, margin, y, textW, 6);
      y += 6;
      y = drawDivider(doc, y);
    }

    // Style hints / feedback
    const hints = feedbackEntries.filter(f => f.feedback_type === 'style_hint' && f.feedback_text);
    const thumbsUp = feedbackEntries.filter(f => f.feedback_type === 'thumbs_up').length;
    const thumbsDown = feedbackEntries.filter(f => f.feedback_type === 'thumbs_down').length;

    y = drawSection(doc, 'User feedback & adaptation', y);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 80);
    doc.text(`Positive: ${thumbsUp}   ·   Negative: ${thumbsDown}`, margin, y);
    y += 8;

    if (hints.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 80);
      doc.text('Registered style hints:', margin, y);
      y += 6;
      hints.forEach((hint) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFillColor(240, 240, 255);
        doc.roundedRect(margin, y - 4, textW, 8, 2, 2, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 100);
        const shortHint = hint.feedback_text.length > 80
          ? hint.feedback_text.slice(0, 77) + '...'
          : hint.feedback_text;
        doc.text(`"${shortHint}"`, margin + 3, y + 1);
        y += 10;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 180);
      doc.text('No style hints yet.', margin, y);
      y += 8;
    }
    y += 4;

    // Uploaded files
    if (includeFiles && knowledgeItems.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      y = drawDivider(doc, y);
      y = drawSection(doc, `Knowledge base - ${knowledgeItems.length} file${knowledgeItems.length !== 1 ? 's' : ''}`, y);

      knowledgeItems.forEach((item, idx) => {
        if (y > 265) { doc.addPage(); y = 20; }

        // Row background
        doc.setFillColor(idx % 2 === 0 ? 248 : 252, 248, 255);
        doc.roundedRect(margin, y - 4, textW, 14, 2, 2, 'F');

        // File name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 50);
        const nameMaxW = 100;
        const displayName = doc.splitTextToSize(item.file_name, nameMaxW)[0];
        doc.text(displayName, margin + 3, y + 3);

        // Type badge
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(99, 102, 241);
        doc.text((item.file_type || 'other').toUpperCase(), margin + 110, y + 3);

        // Date
        doc.setTextColor(140, 140, 170);
        doc.text(format(new Date(item.created_date), 'd. MMM yyyy'), margin + 140, y + 3);

        // Status
        const statusColor = item.status === 'ready' ? [34, 197, 94] : [245, 158, 11];
        doc.setTextColor(...statusColor);
        doc.text(item.status === 'ready' ? 'Ready' : 'Processing', margin + 163, y + 3);

        // Summary if present
        if (item.extracted_summary) {
          y += 10;
          if (y > 270) { doc.addPage(); y = 20; }
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 140);
          const summaryLines = doc.splitTextToSize(`↳ ${item.extracted_summary}`, textW - 6);
          summaryLines.slice(0, 2).forEach((line) => {
            doc.text(line, margin + 3, y);
            y += 5;
          });
        } else {
          y += 14;
        }
      });
    }

    // ── Footer on all pages ──
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 5, 297, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 200);
      doc.text(`AIFaces · ${face.name}`, margin, 291);
      doc.text(`Page ${i} of ${pageCount}`, 175, 291);
    }

    return doc;
  };

  const handleExport = async (includeFiles) => {
    setLoading(true);
    const doc = buildPDF(includeFiles);
    const fileName = `${face.name.replace(/\s+/g, '_')}_report_${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(fileName);
    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={loading}>
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />}
          Export PDF
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={() => handleExport(false)} className="gap-3 py-3 cursor-pointer">
          <Brain className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Knowledge summary only</p>
            <p className="text-xs text-muted-foreground">Summary, style preferences and feedback</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport(true)}
          className="gap-3 py-3 cursor-pointer"
          disabled={knowledgeItems.length === 0}
        >
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Full report incl. files</p>
            <p className="text-xs text-muted-foreground">
              {knowledgeItems.length > 0
                ? `Incl. ${knowledgeItems.length} file${knowledgeItems.length !== 1 ? 's' : ''} from the knowledge base`
                : 'No files uploaded yet'}
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}