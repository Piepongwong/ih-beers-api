const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const default_image_url = "https://images.punkapi.com/v2/2.png";
module.exports.default_image_url = default_image_url;

var beerSchema = new Schema({
    image_url: {type: String, default: default_image_url},
    tagline: {type: String, required: [true, "Beers need taglines."]},
    description: {type: String, required: [true, "Beers deserve descriptions!"]},
    first_brewed: {type: Date, required: [true, "Beers should have a day of birth too. :( Please provide a date in the right format."]},
    brewers_tips: {type: String, required: [true, "What, no tips? How am I supposed to drink. With which food am I supposed to pair this. I'm so confused."]},
    attenuation_level: {type: Number, required: [true, "Which color has this beer? Please provide the attenuation_level as a number."]},
    contributed_by: {type: String, required: [true, "Come on! Are you not proud of this beer?"]},
    name: {
        type: String, 
        required: [true, "How am I supposed to call this beer?" ],
        validate: {
            validator: function(value) {
            return this.model("beer").findOne({name: value})
                    .then((beer)=> {
                        if(beer) throw new Error("A beer with this name already exists.");
                        else return;
                    })
            },
            message: "Beer with this name already exists."
          }
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: false
    }
})

// Makes text search possible
// necessary for /beers/search?query=searchterm route
beerSchema.index({
    name: 'text', 
    tagline: 'text',
    brewers_tips: 'text',
    description: 'text'
});

module.exports = mongoose.model("beer", beerSchema, "beers");