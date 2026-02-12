import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportToPDF = async (elementId, fileName = "report.pdf") => {
  const element = document.getElementById(elementId);

  if (!element) {
    alert("Unable to generate PDF. Content not found.");
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
};
