require('dotenv').config()
const express = require("express");
const app = express();
const bodyParser=require("body-parser");
const nodemailer=require('nodemailer')
const mongoose=require("mongoose");
const autoIncrement = require('mongoose-auto-increment');
const schedule=require('node-schedule')
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.USER,
        pass:process.env.PASSWORD
    }
});
let job='';
mongoose.connect(process.env.DB_URL).then(()=>
{
  console.log("Connected To Database");
}).catch(()=>
{
  console.log("Connection Failed");
});
autoIncrement.initialize(mongoose.connection);
const Mailobj=require("./models/mail");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use((req,res,next)=>
{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS"
  );
  next();
});
app.get('/allmails',(req,res,next)=>{
  Mailobj.find({}).then(docs=>{
    if(docs.length>0)
    {
      res.status(200).json(
        {
          data:docs
        }
      )
    }
    else
    {
      res.status(404).json(
        {
          data:"Sorry no data found"
        }
      )
    }
  })
})
app.get('/filtermails',(req,res,next)=>{
  Mailobj.find({"sender":process.env.USER},{mails: {$elemMatch: {recipient:req.body.recipient}}}).then(docs=>{
    if(docs.length>0)
    {
      res.status(200).json(
        {
          data:docs
        }
      )
    }
    else
    {
      res.status(404).json(
        {
          data:"Sorry no data found"
        }
      )
    }
  })
})

app.get('/filterMailsByStatus',(req,res,next)=>{
  Mailobj.find({"sender":process.env.USER},{mails: {$elemMatch: {status:req.body.status}}}).then(docs=>{
    if(docs.length>0)
    {
      res.status(200).json(
        {
          data:docs
        }
      )
    }
    else
    {
      res.status(404).json(
        {
          data:"Sorry no data found"
        }
      )
    }
  })
})
app.post('/sendMail',(req,res,next)=>
{
    sendMail(req,res,"current");

  });
app.put('/updateTime',(req,res,next)=>{
  const date=req.body.time.split(" ")[0].split("-")
  const time=req.body.time.split(" ")[1].split(":")
  const scheduleTime=new Date(date[0],date[1]-1,date[2],time[0],time[1])
        try{
          job.reschedule(scheduleTime)
          console.log('Mail scheduled time updated now mail will be sent at'+req.body.time);
        res.status(200).json({msg:"Time for the mail updated successfully Updated successfully"})
      }
      catch(err)
      {
        res.status(404).json({msg:"Sorry no mails are scheduled"});
      }
  })
  app.delete('/deleteMail',(req,res,next)=>{
          try{
            job.cancel()
            Mailobj.updateOne({sender:process.env.USER,mails:{$elemMatch:{recipient:req.body.recipient,subject:req.body.subject,status:"scheduled"}}}
            ,{$set:{"mails.$.status":"deleted"}}).then(docs=>{
              res.status(200).json({msg:"Scheduled Mail successfully deleted"})
            })
         
        }
        catch(err)
        {
          res.status(404).json({msg:"Sorry no mails are there to be deleted"});
        }
    })
app.post('/scheduleMail',(req,res,next)=>
{
  var body2;
  const mailBody={
      from:process.env.USER,
       recipient:req.body.recipient,
       subject:req.body.subject,
       text:req.body.text
     }
     var query={sender:process.env.USER};
     var body1={sender:query.sender}
     const options={
       to:req.body.recipient,
       subject:req.body.subject,
       text:req.body.text
   }
   body2={mails:[{...mailBody,status:'scheduled'}]}
   Mailobj.updateOne(query,body1,{upsert:true},function(err,data){
     Mailobj.updateOne(query,{$push:body2},{upsert:true},function(err,data){
         if(data)
         { 

           console.log('Mail scheduled for the time'+req.body.time);
         }
       })
     })
    const date=req.body.time.split(" ")[0].split("-")
    const time=req.body.time.split(" ")[1].split(":")
    const scheduleTime=new Date(date[0],date[1]-1,date[2],time[0],time[1])
      job=schedule.scheduleJob(scheduleTime,()=>{
        Mailobj.updateOne({sender:process.env.USER,mails:{$elemMatch:{recipient:req.body.recipient,subject:req.body.subject,status:"scheduled"}}}
        ,{$set:{"mails.$.status":"sent"}}).then(docs=>{
          transporter.sendMail(options,(error,info)=>{console.log(info.response)});
        })
      });
      res.status(200).json({msg:"Mail scheduled"})
});

function sendMail(req,res,type)
{
  var body2;
  const mailBody={
       recipient:req.body.recipient,
       subject:req.body.subject,
       text:req.body.text
     }
     var query={sender:process.env.USER};
     var body1={sender:query.sender}
     const options={
       to:req.body.recipient,
       subject:req.body.subject,
       text:req.body.text
   }
      transporter.sendMail(options,(error,info)=>{
        if(error)
        {
            console.log(error);
            body2={mails:[{...mailBody,status:'failed'}]}
            
              Mailobj.updateOne(query,body1,{upsert:true},function(err,data){
                Mailobj.updateOne(query,{$push:body2},{upsert:true},function(err,data){
                    if(data)
                    { 

                        res.status(201).json(
                          {
                              message:'Mail sending failed'
                          });
                    }
                  })
                })
        }
        else
        {
              body2={mails:[{...mailBody,status:'sent'}]}
              Mailobj.updateOne(query,body1,{upsert:true},function(err,data){
              Mailobj.updateOne(query,{$push:body2},{upsert:true},function(err,data){
                  if(data)
                  { 

                      res.status(201).json(
                        {
                            message:'Mail sending success'
                        });
                      
                  }
                })
              })
            }
  });
}
module.exports=app;