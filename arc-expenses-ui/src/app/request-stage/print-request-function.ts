export function printRequestPage() {
    let printContents, popupWin;
    printContents = document.getElementById('printable-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=500,width=800');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <style>
            .newStyle {
                display: inline-block;
                background-color: #b2e7c7;
            }
          </style>
          <title>Αίτημα </title>
          <!-- UIkit CSS -->
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/css/uikit.min.css" />

          <!-- UIkit JS -->
          <script src="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/js/uikit.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/js/uikit-icons.min.js"></script>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
}
