import React, { useState } from 'react';
import './Student.css';
import Internship from './Internship';
import ExtraCurricular from './Extra_Curricular';
import Placement from './Placement';
import CompetitiveExamination from './CompetitiveExamination';
import HigherEducation from './HigherEducation';
import BTPDetails from './BTPDetails';
import PaperPresentation from './PaperPresentation';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Student = () => {
    const location = useLocation();
    const editData = location.state ? location.state.data : null;
    const isEditing = !!editData;
    const initialTab = location.state?.type || 'Extra Curricular';

    const [activeTab, setActiveTab] = useState(initialTab);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="student-module">
            <div className="tab-buttons">
                {['Extra Curricular', 'Internships', 'Placement', 'Competitive Exam', 'Higher Education', 'BTP Details', 'Paper Presentation'].map(tab => (
                    <button key={tab} onClick={() => handleTabChange(tab)} className={activeTab === tab ? 'active' : ''}>
                        {tab.replace(/([A-Z])/g, '$1').trim()}
                    </button>
                ))}
            </div>

            {activeTab === 'Extra Curricular' && (
                <>
                    <ExtraCurricular editData={editData}></ExtraCurricular>
                </>

            )}

            {activeTab === 'Internships' && (
                <>
                    <Internship editData={editData}></Internship>
                </>
            )}

            {activeTab === 'Placement' && (
                <>
                    <Placement editData={editData}></Placement>
                </>
            )}

            {activeTab === 'Competitive Exam' && (
                <>
                    <CompetitiveExamination editData={editData}></CompetitiveExamination>
                </>
            )}

            {activeTab === 'Higher Education' && (
                <>
                    <HigherEducation editData={editData}></HigherEducation>
                </>
            )}

            {activeTab === 'BTP Details' && (
                <>
                    <BTPDetails editData={editData}></BTPDetails>
                </>
            )}

            {activeTab === 'Paper Presentation' && (
                <>
                    <PaperPresentation editData={editData}></PaperPresentation>
                </>
            )}

            {/* Placeholder: Add similar blocks for internship, placement, etc. */}


        </div>
    );
};

export default Student;
