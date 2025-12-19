
const { jsPDF } = require('jspdf');

const doc = new jsPDF();
doc.text("Hello world!", 10, 10);
doc.save("test.pdf");
console.log("test.pdf created");
