const mongoose=require('mongoose');
const ItemSchema=new mongoose.Schema({
    name:{type:String,
        required : true
    },
    description:{type: String,
        required:false
    },
    CreatedAt:{type:Date,
        default:Date.now
    }
});
const CategorySchema=new mongoose.Schema({
    name:{type: String,
        required: true,
        unique: true
    },
    CreatedAt:{type:Date,
        default:Date.now
    },
    items:[
        ItemSchema
    ]
});


module.exports=mongoose.model('category',CategorySchema);
