
window.addEventListener('DOMContentLoaded', () => {

    // Setup any needed IPC calls
    myAPI.setupIPC();

    // Let server know that process is ready
    myAPI.ready("Process is ready");
    
    // Allowing updating of answer value
    let textarea = document.querySelector("#question");
    let subBut = document.querySelector("#questSub");

    //Event listener for submit button
    subBut.addEventListener('click', () => {
        let question = textarea.value;
        myAPI.sendQuestion(question);
    });

    // Event listener for API button
    let APIBut = document.querySelector('#APIButton');
    APIBut.addEventListener('click', () => {
        myAPI.APIButtonPushed('API button was pushed');
    });
});
