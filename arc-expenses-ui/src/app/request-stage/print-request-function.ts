export function printRequestPage() {
    let printContents, popupWin;
    printContents = document.getElementById('printable-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=500,width=800');
    // popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <style>
            
          </style>
          <title>Αίτημα </title>
          <!-- UIkit CSS -->
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/css/uikit.min.css" />

          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css"
                integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous"/>

          <link rel="stylesheet" href="../../assets/css/theme.scss" />
          <link rel="stylesheet" href="../../assets/css/theme.update.scss" />
          <link rel="stylesheet" href="./request-stage.component.scss" />
          <link rel="stylesheet" href="./stage-component.scss" />

        </head>
        <body onload="window.print();window.close()">
            <div class="uk-margin">
                ${printContents}
            </div>
        </body>
      </html>`
    );
    // popupWin.document.close();
}
