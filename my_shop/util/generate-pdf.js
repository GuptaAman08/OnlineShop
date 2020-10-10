exports.generateHeader = (doc) => {
    doc
        .image("tactologo.png", 50, 45, { width: 50 })
        .fillColor("#444444")
        .fontSize(20)
        .text("ACME Inc.", 110, 57)
        .fontSize(10)
        .text("123 Main Street", 200, 65, { align: "right" })
        .text("New York, NY, 10025", 200, 80, { align: "right" })
        .moveDown();
}

exports.generateCustomerInformation = (doc, invoice) => {
    const shipping = invoice.shipping;

    doc
        .text(`Invoice Number: 1234`, 50, 200)
        .text(`Invoice Date: ${new Date()}`, 50, 215)
        .text(`Balance Due: $400`, 50, 130)

        .text("Aman Gupta", 300, 200)
        .text("XYZ Villa", 300, 215)
        .text(`Mumbai, Maharashtra, India`, 300, 130)
        .moveDown();
}
