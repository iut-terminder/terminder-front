import {useState, useContext, useEffect, useRef} from 'react'
import './AddDeptLesson.css'
import InputBox from '../../component/input_box/InputBox';
import AuthContext from '../../store/Authentication/AuthContext';
import ToastContext from '../../store/Toast/ToastContext';
import ButtonBox from '../../component/button/ButtonBox';
import UploadReport from './UploadReport';

const AddDeptLesson = () => {
    const authCtx = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    const [deptid, setDeptid] = useState('');
    const [deptname, setDeptname] = useState('');
    const [departments, setDepartments] = useState(null);
    const [counter, setCounter] = useState(0);
    const [selectedDept, setSelectedDept] = useState('');
    const [excelFile, setExcelFile] = useState(null);
    const [sendingFile, setSendingFile] = useState(false);
    const [addingDept, setAddingDept] = useState(false);
    const [uploadReport, setUploadReport] = useState(null);
    const fileInputRef = useRef(null);

    const [fieldid, setFieldid] = useState('');
    const [fieldname, setFieldname] = useState('');
    const [addingField, setAddingField] = useState(false);

    const changeidhandler = (event) => {
        setDeptid(event.target.value.trim());
    };

    const changenamehadndler = (event) => {
        setDeptname(event.target.value); 
    };

    const changeFieldIdHandler = (event) => {
        setFieldid(event.target.value.trim());
    };

    const changeFieldNameHandler = (event) => {
        setFieldname(event.target.value);
    };

    const addDeptbutton = async () => {
        if (deptid.length !== 2 && deptid.length !== 3) return;
        if (deptname.trim().length === 0) return;

        setAddingDept(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/department/`, {
                method:'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authCtx.access}`
                },
                body: JSON.stringify({
                    dept_id: parseInt(deptid),
                    dept_name: deptname.trim()
                }),
            });
            
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const firstError = data.error || data.message || Object.values(data)?.[0]?.[0];
                throw new Error(firstError || 'افزودن دپارتمان انجام نشد.');
            }

            showToast('دپارتمان با موفقیت اضافه شد.', 'success');
            setDeptid('');
            setDeptname('');
            setCounter(counter + 1);
        } catch(error) {
            showToast(error.message || 'افزودن دپارتمان انجام نشد.', 'error');
        } finally {
            setAddingDept(false);
        }
    };

    const addFieldButton = async () => {
        if (fieldid.trim().length === 0) return;
        if (fieldname.trim().length === 0) return;

        setAddingField(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/fields/`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authCtx.access}`
                },
                body: JSON.stringify({
                    field_id: parseInt(fieldid),
                    field_name: fieldname.trim()
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const firstError = data.error || data.message || Object.values(data)?.[0]?.[0];
                throw new Error(firstError || 'افزودن رشته انجام نشد.');
            }

            showToast('رشته با موفقیت اضافه شد.', 'success');
            setFieldid('');
            setFieldname('');
        } catch(error) {
            showToast(error.message || 'افزودن رشته انجام نشد.', 'error');
        } finally {
            setAddingField(false);
        }
    };

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/department/`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authCtx.access}`
                    },
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error('sth went wrong!');
                }

                setDepartments(data);
                
            } catch(error) {
                console.error('invalid:', error);
            }
        };
        
        fetchDepartments();
    }, [counter]);

    const handleDeptChange = (event) => {
        setSelectedDept(event.target.value);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel')) {
            setExcelFile(file);
        } else {
            setExcelFile(null);
        }
    };

    const handlefileSubmit = async () => {
        if (!selectedDept || !excelFile) return;

        setSendingFile(true);
        setUploadReport(null);

        const formData = new FormData();
        formData.append('department_id', selectedDept);
        formData.append('excel_file', excelFile);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/lessons/upload-lessons`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authCtx.access}`,
                },
                body: formData,
            });

            const data = await response.json();

            // اگر پاسخ ساختار گزارش (created/changed/notchanged) را داشته باشد،
            // یعنی حداقل بخشی از فایل پردازش شده—even اگر برخی ردیف‌ها خطا داشته باشند.
            const hasReportShape =
                data && (data.created_lessons || data.changed_lessons || data.notchanged_lessons || data.errors);

            if (!response.ok && !hasReportShape) {
                throw new Error(data.error || data.message || 'خطا در آپلود فایل');
            }

            setUploadReport(data);
            showToast(data.message || 'دروس با موفقیت پردازش شدند', data.success ? 'success' : 'error');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setExcelFile(null);
            setSelectedDept('');
            
        } catch (error) {
            showToast(error.message || 'خطا در آپلود فایل. لطفاً دوباره تلاش کنید', 'error');
        } finally {
            setSendingFile(false);
        }
    };

    return (
        <div>
            <div className='AddBox'>
                <InputBox type="text" value={deptid} onChange={changeidhandler} isValid={true} defualt='10' style={{ width: '15%', height: '50px', fontSize: '1.2rem' }}></InputBox>
                <InputBox type="text" value={deptname} onChange={changenamehadndler} isValid={true} defualt='مهندسی کامپیوتر' style={{ width: '55%', height: '50px', fontSize: '1.2rem' }}></InputBox>
                <ButtonBox onClick={addDeptbutton} defualt='Add Department' loading={addingDept}></ButtonBox>
            </div>

            <div className='AddBox'>
                <InputBox type="text" value={fieldid} onChange={changeFieldIdHandler} isValid={true} defualt='1' style={{ width: '15%', height: '50px', fontSize: '1.2rem' }}></InputBox>
                <InputBox type="text" value={fieldname} onChange={changeFieldNameHandler} isValid={true} defualt='کامپیوتر' style={{ width: '55%', height: '50px', fontSize: '1.2rem' }}></InputBox>
                <ButtonBox onClick={addFieldButton} defualt='Add Field' loading={addingField}></ButtonBox>
            </div>

            <div className='AddBox'>
                <InputBox type='file' ref={fileInputRef} onChange={handleFileChange} isValid={true} style={{ width: '40%', height: '28px' }}></InputBox>

                <select 
                    value={selectedDept} 
                    onChange={handleDeptChange}
                    className='SelectBox'
                >
                    <option value=""> -- Department -- </option>
                    {departments && departments.length > 0 ? (
                        departments.map((dept) => (
                            <option key={dept.dept_id} value={dept.dept_id}>
                                {dept.dept_name}
                            </option>
                        ))
                    ) : (
                        <option disabled>هیچ دپارتمانی یافت نشد</option>
                    )}
                </select>

                <ButtonBox onClick={handlefileSubmit} defualt='Add Lessons' loading={sendingFile} style={{width: '30%', height: '50px'}}></ButtonBox>
            </div>

            <UploadReport report={uploadReport} />
        </div>
    );
};

export default AddDeptLesson;