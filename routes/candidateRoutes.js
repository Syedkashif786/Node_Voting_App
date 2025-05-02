const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const User = require('./../models/user');
const {jwtAuthMiddleware} = require('./../jwt');

//create function for cheking if it is admin
const checkAdminRole = async (userId) => {
    try{
        const user = await User.findById(userId);
        return user.role === 'admin'
    }
    catch(err){
        return err;
    }
};

// Post route to add a candidate 
router.post('/', jwtAuthMiddleware, async(req,res)=>{
    try{

        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'User does not have admin role'})
        }
        const data = req.body;

        //create a new document using the mongoose model
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('Candidate data added successfully!');
        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'})
    }
});

router.put('/:candidateID', jwtAuthMiddleware, async(req, res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message: 'User does not have admin role'});

        const candidateID = req.params.candidateID; //extract the id from the url paramater
        const candidateUpdatedData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, candidateUpdatedData, {
            new: true,    // return the updated document
            validators: true   //Run mongoose validations 
        });
        if(!response){
            return res.status(404).json({error: 'Candidate not found'})
        }
        console.log('candidate data updated successfully!');
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.delete('/:candidateID', jwtAuthMiddleware, async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'User does not have admin role'});
        }
        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);
        if(!response){
            res.status(404).json({error: 'Candidate not found'});
        }
        console.log('Candidate deleted successfully!');
        res.status(200).json({response: response, message: 'Candidate data deleted successfully!'});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

//lets starting voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async(req,res)=>{
    
    //no admin can vote
    //user can vote only one time
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try{
        //find the candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message: 'Candidate Not Found'});
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        if(user.role === 'admin'){
            return res.status(403).json({message: 'Admin not allowed to vote'});
        }
        if(user.isVoted){
            return res.status(400).json({message: 'User already voted.'});
        }

        //update the candiate document to record the vote
        candidate.votes.push({user: userId});
        candidate.voteCount++
        await candidate.save();

        //update the user document
        user.isVoted = true
        await user.save();

        res.status(200).json({message: 'Vote recorded successfully!'});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


//vote count
router.get('/vote/count', async(req,res)=>{
    try{
        //find all the data of the candidate and sort them in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        //map the candidates to only return there name and vote count
        const voteRecord = candidate.map((data)=>{
            return{
                party: data.party,
                voteCount: data.voteCount
            }
        });
        return res.status(200).json(voteRecord);
    }
    catch(err){
        console.log(err);
        res.status(500).json('Internal Server Error');
    }
});

//get all the list of candidates who are standing in election
router.get('/', async(req,res)=>{
    try{
        const candidate = await Candidate.find({},'name party -_id');
        return res.status(200).json(candidate);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;