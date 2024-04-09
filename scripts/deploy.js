const { exec } = require('child_process');
const { ethers, upgrades } = require('hardhat');
require('dotenv').config();
const fs = require('fs');
const { log } = require('console');

// Create a write stream to the text file
const logStream = fs.createWriteStream('steps.txt', { flags: 'a' });

// Function to log console messages to the file
function logToStream(message) {
  console.log(message); // Display the message in the console
  logStream.write(`${message}\n`); // Write the message to the file
}

// Check if npm is installed
exec('npm -v', (error, stdout) => {
  if (error) {
    logToStream('npm is not installed. Please install npm and try again.');
    return;
  }

  logToStream('npm is installed.');

  // Install dependencies
  exec('npm install', (error, stdout, stderr) => {
    if (error) {
      logToStream(`Error installing dependencies: ${stderr}`);
      return;
    }

    logToStream('Dependencies installed successfully.');

    // Compile using Hardhat
    exec('npx hardhat compile', (error, stdout, stderr) => {
      if (error) {
        logToStream(`Error compiling: ${stderr}`);
        return;
      }

      logToStream('Compilation successful.');

      // Ask the user if they want to deploy contracts
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Do you want to deploy the contracts? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
          logToStream('Deploying contracts...');
          try {
            // Deploy Voting contract
            const VotingFactory = await ethers.getContractFactory('VotingSystemDemo');
            
            const votingDeployment = await VotingFactory.deploy();
            const voting = await votingDeployment.waitForDeployment();
            const vote = await votingDeployment.deploymentTransaction();
            console.log(voting.target);
            console.log(voting.target,"wait for deployment") 
            if (voting.target) {
                console.log(`Voting contract deployed to: ${voting.target}`);

              } else {
                console.error('Deployment successful, but unable to fetch contract address.');
              }
            
            console.log(`Voting contract deployed to: ${voting.target}`);

           

            logToStream(`Voting deployed to: ${voting.target}`);

            // Save the contract addresses to a JSON file for reference
            const deploymentData = {
              Voting: voting.target
            };
            fs.writeFileSync(`${voting.target}_Deployment_Data.json`, JSON.stringify(deploymentData));

            logToStream('Deployment successful. Check the deployment data file for contract addresses.');

          } catch (error) {
            logToStream(`Deployment error: ${error.message}`);
            return;
          }
        } else {
          logToStream('Deployment skipped.');
        }

        rl.close();
        logToStream('Success! All steps completed.Contract Deployed on Hedera Hashgraph');
      });
    });
  });
});
