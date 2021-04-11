**Mail Scheduler**
----
API to schedule emails and send them Using MongoDb,Nodejs 

***How to run the project***
* 1 Download the project and in the project directory run npm install to install the required dependencies.
* 2 In the .env file enter your email id and password of the account from which you want to send mails and the link of your mongodb database.
* 3 run node server.js to start the project

***API endpoints***

* **To send mail**
   
   **URL:** http://localhost:3000/sendMail

   **Method:**
  `POST`

  ***Body:*** {"recipient":"email of the receiver","subject":"subject","text":"email text"}

* **To schedule mail**
   
   **URL:** http://localhost:3000/scheduleMail/

   **Method:**
  `POST`

  ***Body:*** {"recipient":"email of the receiver","subject":"subject","text":"email text",time:"time to send mail"}

  **Note=>Time should be in format : 2021-04-11 10:27 or 2021-04-11 16:27**


* **To update the time of the scheduled mail**
   
   **URL:** http://localhost:3000/updateTime

   **Method:**
  `PUT`

  ***Body:*** {"recipient":"email of the receiver whom you have scheduled a mail","subject":"subject of the scheduled mail","time":"new time to be given"}
  
  **Note=>Time should be in format : 2021-04-11 10:27 or 2021-04-11 16:27**

* **To delete the scheduled mail**
   
   **URL:** http://localhost:3000/deleteMail

   **Method:**
  `DELETE`

  ***Body:*** {"recipient":"email of the receiver whom you have scheduled a mail an wanted to delete that mail","subject":"subject of the scheduled mail"}
* **To get the list of all the mails**
   
   **URL:** http://localhost:3000/allmails

   **Method:**
  `GET`

* **To get the list of mails by the mail-id of the receiver**
   
   **URL:** http://localhost:3000/filtermails

   **Method:**
  `GET`

  ***Body:*** {"recipient":"email of the receiver"}
* **To get the list of mails by the status of the mail**

   **URL:** http://localhost:3000/filterMailsByStatus

   **Method:**
  `GET`

  ***Body:*** {"status":"failed or sent or scheduled or deleted"}

   **Note=>There are four status of the mails i.e. sent , failed, scheduled and deleted**
