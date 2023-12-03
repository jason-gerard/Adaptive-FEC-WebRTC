// Variable used to compute the delta of the simulation, will get initialized when the web page is loaded
let startTime = Date.now();

// Lists of the different solutions and metrics to help with recording metrics for test runs
const names = ["Standard", "Corrected", "CorrectedML"];
const metrics = ["frameCount", "frameDisplayed", "errorCountBC", "errorCountAC", "dataPacketCount", "overheadPacketCount"];

// This function is used to reset the simulation or to start a new test run andd wipe the current results
function resetSim() {
    // For each general metric reset its value
    for (let name of names) {
        for (let metric of metrics) {
            const count = document.getElementById(metric + name);
            count.innerHTML = "0";
        }
    }

    // For the delay metrics for each solution reset its values
    for (let name of names) {
        const el = document.getElementById(`delay${name}`);
        el.innerHTML = "";
    }

    // Reset the n list value for the ML corrected solution
    document.getElementById("nList").innerHTML = "";

    startTime = Date.now();
}

// This function will save the results in CSV format and prompt the user to download them
function saveResults() {
    // Create a CSV for all the general metrics
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
    
    // Compute the duration of the simulation run in milliseconds
    const endTime = Date.now();
    const duration = endTime - startTime; // milliseconds
    
    // Add in the duration to the results
    csv += "\n";
    csv += `duration,${duration}`;
    
    // Add the different n values to the CSV results
    const nList = document.getElementById("nList").innerHTML;

    csv += "\n";
    csv += `nList,${nList}`;

    // Add the delay results for each solution
    for (let name of names) {
        const delays = document.getElementById(`delay${name}`).innerHTML;
        csv += "\n";
        csv += `${name},${delays}`;
    }

    // The code block below will prompt the user to download a csv file of the results
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `results_${+new Date()}.csv`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// This function is called when the timed run button is clicked, it will run a 30 second simulation run then save the
// results and then reset the simulation for a new test run
function timedRun() {
    const duration = 30 * 1000; // 30 seconds

    resetSim();
    
    // After 30 seconds, save the results then reset the simulation
    setTimeout(() => {
        saveResults();
        resetSim();
    }, duration);
}