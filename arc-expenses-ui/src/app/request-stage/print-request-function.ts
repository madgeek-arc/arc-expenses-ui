export function printRequestPage(reqId: string, reqType: string) {
    let printContents, popupWin;
    printContents = document.getElementById('printable-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0, left=0, height=500, width=800');
    popupWin.document.open();
    popupWin.document.write(`
      <!doctype html>
      <html>
        <head>
          <style>
            @media print {
                @page {
                    size: A4;
                }
                .uk-card-basic-info {
                    page-break-inside: avoid;
                    page-break-before: auto;
                    page-break-after: always;
                }
            }
            body {
                padding: 50px 20px 50px 20px;
            }
            .no-print {
                display: none;
            }
            .uk-card-basic-info {
                background: rgba(103,118,144,0.05);
                border: 1px solid lightgray;
                border-radius: 2px;
                padding: 20px 20px;
                page-break-inside: avoid;
                page-break-before: auto;
                page-break-after: always;
            }
          </style>
          <title>Αίτημα ${reqId}</title>

          <!-- UIkit CSS -->
          <link rel="stylesheet" type="text/css"
                href="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/css/uikit.min.css" media="all" />

          <link rel="stylesheet" type="text/css" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" media="all"
                integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous"/>

        </head>
        <body onload="window.print();window.close()">
            <h1 class="uk-h3 uk-heading-bullet uk-margin-top">
              Αίτημα ${reqId} <span>[${reqType}]</span>
            </h1>
            <div>
                ${printContents}
            </div>
        </body>
      </html>`
    );
    popupWin.document.close();
}
