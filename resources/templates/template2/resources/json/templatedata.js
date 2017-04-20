var question =[

    {

        type:"limit-bucket-dragdrop-clone",
        questionId:"1",
        questionTitle:"",
        questionText:"Simplify and drag at least three numbers to each bucket.",
        questionInstructionText:"Drag and Drop the given numbers in the appropriate bucket. Some numbers could go to more than one bucket.",
        draggables:[
             {
                id:1,
                imageUrl:"./resources/templates/template2/resources/images/maths-lesson11-q2-three.jpg",
                text:"Drag-1",
                targetArea:2,
                width:"125",
                height:"25",
                top:"480",
                left:"35"
            },
             {
                id:2,
                imageUrl:"./resources/templates/template2/resources/images/maths-lesson11-q2-five.jpg",
                text:"Drag-1",
                targetArea:2,
                width:"125",
                height:"25",
                top:"480",
                left:"179"
            },
             {
                id:3,
                imageUrl:"./resources/templates/template2/resources/images/maths-lesson11-q2-six.jpg",
                text:"Drag-1",
                targetArea:2,
                width:"125",
                height:"25",
                top:"480",
                left:"322"
            },
             {
                id:4,
                imageUrl:"./resources/templates/template2/resources/images/maths-lesson11-q2-seven.jpg",
                text:"Drag-1",
                targetArea:2,
                width:"125",
                height:"25",
                top:"480",
                left:"466"
            },
             {
                id:5,
                imageUrl:"./resources/templates/template2/resources/images/maths-lesson11-q2-nine.jpg",
                text:"Drag-1",
                targetArea:2,
                width:"125",
                height:"25",
                top:"480",
                left:"608"
            },
             {
                id:6,
                imageUrl:"./resources/templates/template2/resources/images/maths-lesson11-q2-ten.jpg",
                text:"Drag-1",
                targetArea:2,
                width:"125",
                height:"25",
                top:"550",
                left:"98"
            },
             {
                id:7,
                imageUrl:"./resources/templates/template2/resources/images/maths-lesson11-q2-eleven.jpg",
                text:"Drag-1",
                targetArea:2,
                width:"125",
                height:"25",
                top:"550",
                left:"248"
            },
             {
                id:8,
                imageUrl:"./resources/templates/template2/resources/images/maths-lesson11-q2-twelve.jpg",
                text:"Drag-1",
                targetArea:2,
                width:"125",
                height:"25",
                top:"550",
                left:"399"
            },
             {
                id:9,
                imageUrl:"./resources/templates/template2/resources/images/maths-lesson11-q2-fourteen.jpg",
                text:"Drag-1",
                targetArea:2,
                width:"125",
                height:"25",
                top:"550",
                left:"546"
            }


        ],
        dropArea:[
            {
                id:"",
                imageUrl:"",
                text:"",
                targetArea:""
            },
            {
                id:"",
                imageUrl:"",
                text:"",
                targetArea:""
            },
            {
                id:"",
                imageUrl:"",
                text:"",
                targetArea:""
            }

        ],
        bucketData:[
            {
                id:1,
                text:"Real Numbers<br>(Bucket Limit = 3)",
                imageUrl:"",
                width:"160",
                height:"279",
                top:"154",
                left:"35",
                answerArray:[1,0,0,0,0,0,0,1,1],// total should be = bucket Limit
                correctAnsLength:3,
                bucketLimit:"9"
            },
            {
                id:2,
                text:"Pure Imaginary<br>(Bucket Limit = 3)",
                imageUrl:"",
                width:"160",
                height:"279",
                top:"154",
                left:"238",
                answerArray:[1,1,0,0,0,0,0,0,1],// total should be = bucket Limit
                correctAnsLength:3,
                bucketLimit:"9"
            },
            {
                id:3,
                text:"Non-Real Complex<br>(Bucket Limit = 8)",
                imageUrl:"",
                width:"160",
                height:"279",
                top:"154",
                left:"442",
                answerArray:[1,0,1,1,1,1,1,1,1],// total should be = bucket Limit
                correctAnsLength:8,
                bucketLimit:"9"
            }

        ],
        bucketDragTopMargin:5,
        feedback:{
            correctFeedback:"Correct! ",
            incorrectFeedback:"Thats not correct. Please try again. ",
            partial:"This is partially correct. Please try again. "
        },
        finalFeedback:{
            correctFeedback:"Great job! You have answered all correctly. ",
            incorrectFeedback:" Thats not correct. Please see the solution. ",
            partial:"This is partially correct. Please see the solution."
        },
        isAssessmentTemplates:true,
        config:{
            attempts:2,
            isDragDrop:false,
            isBucketDragDrop:false,/*true for all bucket drag drop*/
            isSingleBucketDragDrop : false,/*true if single bucket drag drop*/
            isFixedDragDrop : false,/*true if there are limits on  bucket drag drop*/
            isDragDropWithClone:true,/*true if there drag drop with clone*/
            bucketCorrectAnsLength :0,/*true if single bucket drag drop*/
            totalLimitOfBucket:27,
            isMultipleChoice:false,
            isMultiSelect: false,
            isSingleSelect:false,
            isFillInTheBlank:false,
            isTimer:false,
            isHotSpot:false,
            isHotSpotMultiSelect:false,
            isHotSpotSequential:false,
            isHotSpotNonSequential:false,
            isZoom:false,
            isPrint:false,
            isNotepad:true,
            isSingleQuestion:true
        }
    }
];
