import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

export function printRequestPage(reqId: string, reqType: string) {
    /* TODO:: DELETE WHEN EXPORT TO PDF IS THE ONLY ONE USED -- !!! DONT FORGET TO ALSO REMOVE ALL no-print CLASSES */
    // let printContents, popupWin;
    // printContents = document.getElementById('printable-section').innerHTML;
    // popupWin = window.open('', '_blank', 'top=0, left=0, height=500, width=800');
    // popupWin.document.open();
    // popupWin.document.write(`
    //   <!doctype html>
    //   <html>
    //     <head>
    //       <style>
    //         @page {
    //             size: A4;
    //             margin-top: 2cm;
    //         }
    //         body {
    //             padding: 50px 20px 50px 20px;
    //         }
    //         .no-print {
    //             display: none;
    //         }
    //         .uk-card-basic-info {
    //             background: rgba(103,118,144,0.05);
    //             border: 1px solid lightgray;
    //             border-radius: 2px;
    //             padding: 20px 20px;
    //             page-break-inside: avoid;
    //             margin-bottom: 6px;
    //         }
    //       </style>
    //       <title>Αίτημα ${reqId}</title>
    //
    //       <!-- UIkit CSS -->
    //       <link rel="stylesheet" type="text/css"
    //             href="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/css/uikit.min.css" media="all" />
    //
    //       <link rel="stylesheet" type="text/css" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" media="all"
    //             integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous"/>
    //
    //     </head>
    //     <body onload="window.print();window.close()">
    //         <h1 class="uk-h3 uk-heading-bullet uk-margin-top">
    //           Αίτημα ${reqId} <span>[${reqType}]</span>
    //         </h1>
    //         <div>
    //             ${printContents}
    //         </div>
    //     </body>
    //   </html>`
    // );
    // popupWin.document.close();


    /*
    *  HOW IT WORKS:
    *  - install html2canvas and jspdf [https://www.npmjs.com/package/html2canvas, https://www.npmjs.com/package/jspdf]
    *  - add 'printable-section' id to the div that wraps all the html elements you want to print
    *  - add an data-html2canvas-ignore attribute (no value needed) to each html element you want to exclude
    *  - the script below also uses an extra html element with id 'requestTitle' to include the div with the page title
    */
    const data = document.getElementById('printable-section');
    const titleNode = document.getElementById('requestTitle');
    data.insertBefore(titleNode, data.childNodes[0]);

    const imgDiv = document.createElement('div');
    imgDiv.setAttribute('id', 'logoimg');
    const logo = document.createElement('img');
    logo.setAttribute('src', '../../assets/imgs/ARCLogo.png');
    logo.setAttribute('width', '400');
    logo.setAttribute('style', 'display:inline-block; margin-right: 20px;');
    imgDiv.appendChild(logo);

    const appTitle = document.createElement('h4');
    appTitle.setAttribute('style', 'text-align: right; float:right;');
    appTitle.innerText = 'Εφαρμογή διαχείρισης πρωτογενών αιτημάτων';
    imgDiv.appendChild(appTitle);

    data.insertBefore(imgDiv, data.childNodes[0]);

    /* if windowWidth/Height are not set then the canvas is created according to the current browser aspect ratio */
    html2canvas(data, {windowWidth: 1240, windowHeight: 1754, scale: 2}).then(canvas => {
        // Few necessary setting options
        const imgWidth = 190;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jspdf(); // A4 size page of PDF, portrait, using millimeters
        pdf.addImage(contentDataURL, 8, 10, imgWidth, imgHeight);
        const filename = reqId + '.pdf';
        pdf.save(filename, {usePromise: true}); // Generated PDF

        /* THE POPUP WINDOW IS BLOCKED BY THE BROWSER */
        // const file = new Blob([pdf.output('blob', {filename: filename})], {type: 'application/pdf'});
        // const fileURL = URL.createObjectURL(file);
        // window.open(fileURL, '_blank');

        data.removeChild(document.getElementById('logoimg'));
    });

}
