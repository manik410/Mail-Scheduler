const mongoose=require("mongoose");
const MailSchema=mongoose.Schema(
  {
    sender:{type:String,required:true},
    mails:[
      {
        status:{type:String},
        recipient:{type:String},
        subject:{type:String},
        text:{type:String}
      }]
  })
module.exports=mongoose.model('mail',MailSchema);
