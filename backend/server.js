// server.js
const express = require('express');
const cors = require('cors');
// require('dotenv').config();
require('dotenv').config({ path: __dirname + '/.env' });

const facultyRoutes = require('./routes/FacultyInfo');
const otpRoutes = require('./routes/otp');
const authRoutes = require('./routes/auth');
const pubRoutes = require('./routes/publications'); 
const expertTalkRoutes = require('./routes/experttalk');
const eventOrganizedRoutes = require('./routes/eventOrganized');
const eventAttendedRoutes = require('./routes/eventAttended');
const paperReviewRoutes = require('./routes/paperReviews');
const ProjectPatentMoURoutes = require('./routes/projectpatentMoU');
const ExtraCurricularRoutes = require('./routes/extraCurricular');
const internsRoutes = require('./routes/internship');
const PlacementRoutes= require('./routes/Placement');
const competitiveExamsRoutes = require('./routes/CompetitiveExamination');
const HighEducationRoutes = require('./routes/HigherEducation');
const BTPRoutes = require('./routes/BTPDetails');
const PaperPresentationRoutes = require('./routes/PaperPresentations');
const FacultyRoutes = require('./routes/Faculty');
const ResearchRoutes = require('./routes/ResearchCentre');
const AnnualReportRoutes = require('./routes/AnnualReport');
const EditDetailsRoutes = require('./routes/EditDetails');
const StudentRoutes = require('./routes/Student.js');
const path = require('path');
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/faculty-info', facultyRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/publications', pubRoutes);
app.use('/api/expert-talks', expertTalkRoutes);
app.use('/api/event-organized', eventOrganizedRoutes);
app.use('/api/event-attended', eventAttendedRoutes);
app.use('/api/paper-reviews', paperReviewRoutes);
app.use('/api/project-patent-mou', ProjectPatentMoURoutes);
app.use('/api/extra-curricular', ExtraCurricularRoutes);
app.use('/api/internship', internsRoutes);
app.use('/api/placement',PlacementRoutes);
app.use('/api/competitive-exams',competitiveExamsRoutes);
app.use('/api/higher-education',HighEducationRoutes);
app.use('/api/btp-details',BTPRoutes);
app.use('/api/paper-presentations',PaperPresentationRoutes);
app.use('/api/faculty', FacultyRoutes);
app.use('/api/research-centres', ResearchRoutes);
app.use('/api/annual-report', AnnualReportRoutes);
app.use('/api/edit', EditDetailsRoutes);
app.use('/api/student', StudentRoutes);
// app.use('/uploads/:cert_path', express.static(cert_path));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const PORT = process.env.PORT || 5000;
// server.js
app.get('/ping', (req, res) => {
    console.log('Ping received!');
    res.json({ status: 'ok', timestamp: Date.now() });
});

  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // console.log(path.join(__dirname, 'uploads'))
});
