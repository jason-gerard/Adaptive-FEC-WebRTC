let startTime = Date.now();

function resetSim() {
    const names = ["Standard", "Corrected", "CorrectedML"];
    const metrics = ["frameCount", "frameDisplayed", "errorCountBC", "errorCountAC"];
    
    for (let name of names) {
        for (let metric of metrics) {
            const count = document.getElementById(metric + name);
            count.innerHTML = "0";
        }
    }
    
    startTime = Date.now();
}

function saveResults() {
    const names = ["Standard", "Corrected", "CorrectedML"];
    const metrics = ["frameCount", "frameDisplayed", "errorCountBC", "errorCountAC"];

    let csv = "";
    csv += ["Name"].concat(metrics).join(",") + "\n";
    for (let name of names) {
        let line = [name];
        for (let metric of metrics) {
            const count = document.getElementById(metric + name);
            line.push(count.innerHTML);
        }
        
        csv += line.join(",") + "\n";
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime; // milliseconds
    
    csv += "\n";
    csv += `duration,${duration}`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', "results.csv");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}