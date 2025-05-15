import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '@/constants/Config';
import { useUser } from '../../contexts/UserContext';

interface ClassItem {
  id: string;
  name: string;
  school_name: string;
}

interface Subject {
  name: string;
  hk1: string;
  hk2: string;
  cn: string;
}

interface ClassData {
  class: string;
  subjects: Subject[];
}

interface StudentItem {
  id: string;
  name: string;
  gender: string;
  dob: string;
  phone: string;
  school: string;
  academicPerformance: string;
  conduct: string;
  classList?: ClassData[];
  subjects?: Subject[];
  images?: string[];
}

interface ReportCard {
  student: StudentItem;
  classList: ClassData[];
  class_name: string;
  academic_perform_year1: string;
  report_card?: {
    id: string;
  };
}

const StatisticsScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('Xem thống kê điểm số');
  const [semester, setSemester] = useState('1');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('12');
  const [subject, setSubject] = useState<string | null>(null);
  const [classList, setClassList] = useState<ClassItem[]>([]);
  const [studentsData, setStudentsData] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [semesters] = useState<string[]>(['1', '2', 'Cả năm']);
  const [grades] = useState<string[]>(['10', '11', '12']);
  const [className, setClassName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setErrorMessage('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    const fetchTeacherClasses = async () => {
      try {
        const response = await fetch(`${BASE_URL}classroom/get_classrooms/?teacher_id=${user.uid}`, {
          headers: {
            Authorization: `Bearer ${user.uid}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setClassList(data);
      } catch (error) {
        console.error('Lỗi khi gọi API lớp:', error);
        setErrorMessage('Lỗi kết nối khi tải danh sách lớp. Vui lòng kiểm tra mạng.');
      }
    };

    fetchTeacherClasses();
  }, [user?.uid]);

  useEffect(() => {
    if (selectedClassId) {
      fetchStudentsData(selectedClassId);
    } else {
      setStudentsData([]);
      setSubjects([]);
      setClassName(null);
    }
  }, [selectedClassId, selectedGrade]);

  const sanitizeSubjectName = (name: string) => {
    if (!name) return '';
    const cleanedName = name.includes(':') ? name.split(':')[0].trim() : name.trim();
    return cleanedName
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const fetchStudentsData = async (classId: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const studentsResponse = await fetch(
        `${BASE_URL}classroom/get_students_by_class/?class_id=${classId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.uid}`,
          },
        }
      );

      if (!studentsResponse.ok) {
        throw new Error(`HTTP error! status: ${studentsResponse.status}`);
      }

      const students = await studentsResponse.json();

      const reportCardsPromises = students.map(async (student: any) => {
        try {
          const reportCardResponse = await fetch(
            `${BASE_URL}ocr/get_full_report_card/?student_id=${student.id}`,
            {
              headers: {
                Authorization: `Bearer ${user?.uid}`,
              },
            }
          );

          if (!reportCardResponse.ok) {
            console.warn(`Không thể lấy học bạ cho học sinh ${student.id}`);
            return null;
          }

          const reportCardData = await reportCardResponse.json();
          return reportCardData;
        } catch (error) {
          console.error(`Lỗi khi lấy học bạ cho học sinh ${student.id}:`, error);
          return null;
        }
      });

      const reportCardsData = (await Promise.all(reportCardsPromises)).filter(Boolean);

      if (reportCardsData.length === 0) {
        setErrorMessage('Không có dữ liệu học bạ nào cho lớp này');
        setSubjects([]);
        setLoading(false);
        return;
      }

      const formattedStudents: StudentItem[] = reportCardsData.map((report: any) => {
        const studentClass = report.class_name || 'Không xác định';
        const currentClass = report.classList?.find((cls: any) => cls.class === selectedGrade) || report.classList?.[report.classList.length - 1];

        return {
          id: report.student.id,
          name: report.student.name || '',
          gender: report.student.gender || '',
          dob: report.student.dob || '',
          phone: report.student.phone || '',
          school: report.student.school || '',
          academicPerformance: report.academic_perform_year1 || '',
          conduct: report.conduct || '',
          classList: report.classList || [],
          subjects: currentClass?.subjects?.map((sub: any) => {
            const subjectName = sanitizeSubjectName(sub.name);
            return {
              name: subjectName,
              hk1: sub.hk1?.toString() || '0',
              hk2: sub.hk2?.toString() || '0',
              cn: sub.cn?.toString() || '0',
            };
          }) || [],
        };
      });

      setStudentsData(formattedStudents);

      if (formattedStudents.length > 0 && formattedStudents[0].subjects && formattedStudents[0].subjects.length > 0) {
        const uniqueSubjects = [
          ...new Set(
            formattedStudents[0].subjects
              .map((s) => sanitizeSubjectName(s.name))
              .filter((name) => name && !name.toLowerCase().includes('dtb'))
          ),
        ];
        setSubjects(uniqueSubjects);
        setSubject(uniqueSubjects[0] || null);
        setClassName(formattedStudents[0].classList?.find((cls: any) => cls.class === selectedGrade)?.class || reportCardsData[0].class_name);
      } else {
        setSubjects([]);
        setSubject(null);
        setErrorMessage(`Không có môn học nào cho lớp ${selectedGrade}`);
      }
    } catch (error) {
      console.error('Lỗi khi gọi API học sinh:', error);
      setErrorMessage('Lỗi khi tải dữ liệu học sinh. Vui lòng thử lại.');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageScores = () => {
    if (!subject || isPassFailSubject(subject)) {
      return 'N/A'; // Không tính điểm trung bình cho môn đặc biệt
    }

    let total = 0;
    let count = 0;
    studentsData.forEach((student) => {
      const subjectData = student.subjects?.find((s) => s.name === subject);
      if (subjectData) {
        const scoreStr = semester === '1' ? subjectData.hk1 : semester === '2' ? subjectData.hk2 : subjectData.cn;
        const score = parseFloat(scoreStr);
        if (!isNaN(score)) {
          total += score;
          count += 1;
        }
      }
    });
    return count > 0 ? Number((total / count).toFixed(1)) : 0;
  };

  const calculateStudentScoresData = () => {
    if (!subject || !studentsData.length) {
      console.log('No subject or students data available');
      return {
        labels: [],
        datasets: [
          { data: [], color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`, strokeWidth: 2 },
          { data: [], color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, strokeWidth: 2 },
        ],
      };
    }

    const labels = studentsData.map((student) => student.name);
    const scores = studentsData.map((student) => {
      const subjectData = student.subjects?.find((s) => {
        // So sánh tên môn học đã được chuẩn hóa
        const studentSubject = sanitizeSubjectName(s.name);
        const selectedSubject = sanitizeSubjectName(subject || '');
        return studentSubject === selectedSubject;
      });

      if (!subjectData) {
        console.warn(`Subject ${subject} not found for student ${student.name}`);
        return 0;
      }

      const scoreStr = semester === '1' ? subjectData.hk1 :
                      semester === '2' ? subjectData.hk2 :
                      subjectData.cn;

      // Xử lý trường hợp điểm là chuỗi rỗng
      if (scoreStr === '' || scoreStr === null || scoreStr === undefined) {
        console.warn(`Empty score for ${student.name}, subject ${subject}`);
        return 0;
      }

      const score = parseFloat(scoreStr);
      if (isNaN(score)) {
        console.warn(`Invalid score format for ${student.name}: ${scoreStr}`);
        return 0;
      }
      return score;
    });

    const averageScore = calculateAverageScores();
    const averageLine = Array(labels.length).fill(averageScore);

    return {
      labels,
      datasets: [
        {
          data: scores,
          color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: averageLine,
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const calculateWeaknessAnalysis = () => {
    const averages: { [key: string]: number } = {};
    const failedStudents: { [key: string]: string[] } = {}; // Lưu danh sách học sinh không đạt

    subjects.forEach((subj) => {
      if (isPassFailSubject(subj)) {
        // Xử lý môn chỉ có Đạt/Không đạt
        studentsData.forEach((student) => {
          const subjectData = student.subjects?.find((s) => s.name === subj);
          if (subjectData) {
            const scoreStr = subjectData.cn; // Xem điểm cả năm
            if (scoreStr === '0' || scoreStr.toLowerCase() === 'không đạt') {
              if (!failedStudents[subj]) {
                failedStudents[subj] = [];
              }
              failedStudents[subj].push(student.name);
            }
          }
        });
        return; // Bỏ qua không tính điểm trung bình
      }

      let total = 0;
      let count = 0;
      studentsData.forEach((student) => {
        const subjectData = student.subjects?.find((s) => s.name === subj);
        if (subjectData) {
          const score = parseFloat(
            semester === '1' ? subjectData.hk1 : semester === '2' ? subjectData.hk2 : subjectData.cn
          );
          if (!isNaN(score)) {
            total += score;
            count += 1;
          }
        }
      });
      averages[subj] = count > 0 ? Number((total / count).toFixed(1)) : 0;
    });

    // Tạo kết quả phân tích
    const result = [];

    // Thêm các môn bình thường cần cải thiện
    result.push(
      ...subjects
        .filter((subj) => !isPassFailSubject(subj) && averages[subj] < 5.5)
        .map((subj) => ({
          subject: subj,
          score: averages[subj],
          improvement: `Cần cải thiện kỹ năng môn ${subj}`,
        }))
    );

    Object.keys(failedStudents).forEach((subj) => {
      result.push({
        subject: subj,
        score: 0,
        improvement: `Có ${failedStudents[subj].length} học sinh không đạt: ${failedStudents[subj].join(', ')}`,
      });
    });

    return result;
  };

  const calculatePerformanceDistribution = () => {
    const distribution = { excellent: 0, good: 0, needsImprovement: 0 };

    studentsData.forEach((student) => {
      if (!student.subjects || student.subjects.length === 0) return;

      // Chỉ tính các môn không phải môn đặc biệt
      const validSubjects = student.subjects.filter(
        (subj) => !isPassFailSubject(subj.name)
      );

      if (validSubjects.length === 0) return;

      const avgScore =
        validSubjects.reduce((sum, subj) => {
          const score = parseFloat(
            semester === '1' ? subj.hk1 : semester === '2' ? subj.hk2 : subj.cn
          );
          return sum + (isNaN(score) ? 0 : score);
        }, 0) / validSubjects.length;

      if (avgScore >= 8.0) distribution.excellent += 1;
      else if (avgScore >= 6.5) distribution.good += 1;
      else distribution.needsImprovement += 1;
    });

    return [
      {
        name: 'Xuất sắc',
        population: distribution.excellent,
        color: '#38A169',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: 'Khá',
        population: distribution.good,
        color: '#3182CE',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: 'Cần cải thiện',
        population: distribution.needsImprovement,
        color: '#DD6B20',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
    ];
  };

  const isPassFailSubject = (subjectName: string) => {
    const passFailSubjects = ['Thể dục'];
    return passFailSubjects.some(name =>
      subjectName.toLowerCase().includes(name.toLowerCase())
    );
  };

  const renderScoreStatistics = () => (
    <View style={styles.tabContent}>
      <View style={styles.classPickerContainer}>
        <Text style={styles.filterLabel}>Chọn lớp:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedClassId}
            onValueChange={(itemValue) => setSelectedClassId(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Chọn lớp..." value={null} />
            {classList.map((cls) => (
              <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066CC" style={styles.loadingIndicator} />
      ) : errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : selectedClassId && studentsData.length > 0 ? (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Học kỳ:</Text>
          <View style={styles.filterOptions}>
            {semesters.map((sem) => (
              <TouchableOpacity
                key={sem}
                style={[styles.filterOption, semester === sem && styles.activeFilter]}
                onPress={() => setSemester(sem)}
              >
                <Text style={semester === sem ? styles.activeFilterText : styles.filterText}>
                  {sem === '1' ? 'Học kỳ 1' : sem === '2' ? 'Học kỳ 2' : 'Cả năm'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Lớp:</Text>
          <View style={styles.filterOptions}>
            {grades.map((grade) => (
              <TouchableOpacity
                key={grade}
                style={[styles.filterOption, selectedGrade === grade && styles.activeFilter]}
                onPress={() => setSelectedGrade(grade)}
              >
                <Text style={selectedGrade === grade ? styles.activeFilterText : styles.filterText}>
                  Lớp {grade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {subjects.length > 0 ? (
            <>
              <Text style={styles.filterLabel}>Môn học:</Text>
              <View style={styles.filterOptions}>
                {subjects.map((subj) => {
                  const isPassFail = isPassFailSubject(subj);
                  return (
                    <TouchableOpacity
                      key={subj}
                      style={[
                        styles.filterOption,
                        subject === subj && styles.activeFilter,
                        isPassFail && styles.passFailSubject
                      ]}
                      onPress={() => setSubject(subj)}
                    >
                      <Text style={subject === subj ? styles.activeFilterText : styles.filterText}>
                        {subj} {isPassFail && ' (Đ/KĐ)'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={styles.errorText}>Không có môn học nào cho lớp {selectedGrade}.</Text>
          )}
        </View>
      ) : (
        <Text style={styles.errorText}>Chưa chọn lớp hoặc không có dữ liệu học sinh.</Text>
      )}

      {selectedClassId && subject && studentsData.length > 0 && !errorMessage && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Kết quả thống kê:</Text>

          {isPassFailSubject(subject) ? (
            // Hiển thị thống kê cho môn Đạt/Không đạt
            <>
              <Text style={styles.resultText}>
                Môn {subject} (Đạt/Không đạt):
              </Text>
              <View style={styles.passFailContainer}>
                <View style={styles.passFailItem}>
                  <Text style={styles.passFailLabel}>Số học sinh đạt:</Text>
                  <Text style={styles.passFailValue}>
                    {
                      studentsData.filter(student => {
                        const subjectData = student.subjects?.find(s => s.name === subject);
                        const score = subjectData?.cn;
                        return score && score !== '0' && !score.toLowerCase().includes('không đạt');
                      }).length
                    }/{studentsData.length}
                  </Text>
                </View>
                <View style={styles.passFailItem}>
                  <Text style={styles.passFailLabel}>Số học sinh không đạt:</Text>
                  <Text style={[styles.passFailValue, styles.failValue]}>
                    {
                      studentsData.filter(student => {
                        const subjectData = student.subjects?.find(s => s.name === subject);
                        const score = subjectData?.cn;
                        return score && (score === '0' || score.toLowerCase().includes('không đạt'));
                      }).length
                    }
                  </Text>
                </View>
              </View>

              {studentsData.some(student => {
                const subjectData = student.subjects?.find(s => s.name === subject);
                const score = subjectData?.cn;
                return score && (score === '0' || score.toLowerCase().includes('không đạt'));
              }) && (
                <View style={styles.failListContainer}>
                  <Text style={styles.failListTitle}>Học sinh không đạt:</Text>
                  {studentsData
                    .filter(student => {
                      const subjectData = student.subjects?.find(s => s.name === subject);
                      const score = subjectData?.cn;
                      return score && (score === '0' || score.toLowerCase().includes('không đạt'));
                    })
                    .map((student, index) => (
                      <Text key={index} style={styles.failListItem}>
                        • {student.name}
                      </Text>
                    ))}
                </View>
              )}
            </>
          ) : (
            // Hiển thị thống kê cho môn thường
            <>
              <Text style={styles.resultText}>
                Điểm trung bình môn {subject} {semester === '1' ? 'học kỳ 1' : semester === '2' ? 'học kỳ 2' : 'cả năm'} lớp {className}:
                <Text style={styles.highlightText}> {calculateAverageScores()}</Text>
              </Text>

              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={calculateStudentScoresData()}
                  width={Math.max(Dimensions.get('window').width - 40, studentsData.length * 60)}
                  height={220}
                  yAxisLabel="Điểm "
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: '6', strokeWidth: '2', stroke: '#0066CC' },
                    propsForBackgroundLines: { stroke: '#e0e0e0' },
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 16 }}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                />
              </ScrollView>
              <Text style={styles.noteText}>
                Lưu ý: Đường màu đỏ thể hiện điểm trung bình của lớp.
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );

  const renderReport = () => {
    const averageScores: { [key: string]: number } = {};
    subjects.forEach((subj) => {
      if (isPassFailSubject(subj)) return; // Bỏ qua môn chỉ có Đạt/Không đạt

      let total = 0;
      let count = 0;
      studentsData.forEach((student) => {
        const subjectData = student.subjects?.find((s) => s.name === subj);
        if (subjectData) {
          const score = parseFloat(
            semester === '1' ? subjectData.hk1 :
            semester === '2' ? subjectData.hk2 :
            subjectData.cn
          );
          if (!isNaN(score)) {
            total += score;
            count += 1;
          }
        }
      });
      averageScores[subj] = count > 0 ? Number((total / count).toFixed(1)) : 0;
    });

    // Tìm môn có điểm cao nhất và thấp nhất
    let bestSubject = '';
    let bestScore = 0;
    let worstSubject = '';
    let worstScore = 10;
    let overallAverage = 0;
    let subjectCount = 0;

    subjects.forEach((subj) => {
      if (isPassFailSubject(subj)) return; // Bỏ qua môn chỉ có Đạt/Không đạt

      if (averageScores[subj] > bestScore) {
        bestScore = averageScores[subj];
        bestSubject = subj;
      }
      if (averageScores[subj] < worstScore) {
        worstScore = averageScores[subj];
        worstSubject = subj;
      }
      overallAverage += averageScores[subj];
      subjectCount += 1;
    });

    overallAverage = subjectCount > 0 ? Number((overallAverage / subjectCount).toFixed(1)) : 0;

    return (
      <View style={styles.tabContent}>
        {/* Phần chọn lớp và học kỳ giống với tab Thống kê điểm */}
        <View style={styles.classPickerContainer}>
          <Text style={styles.filterLabel}>Chọn lớp:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedClassId}
              onValueChange={(itemValue) => setSelectedClassId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn lớp..." value={null} />
              {classList.map((cls) => (
                <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
              ))}
            </Picker>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0066CC" style={styles.loadingIndicator} />
        ) : errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : selectedClassId && studentsData.length > 0 ? (
          <>
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Học kỳ:</Text>
              <View style={styles.filterOptions}>
                {semesters.map((sem) => (
                  <TouchableOpacity
                    key={sem}
                    style={[styles.filterOption, semester === sem && styles.activeFilter]}
                    onPress={() => setSemester(sem)}
                  >
                    <Text style={semester === sem ? styles.activeFilterText : styles.filterText}>
                      {sem === '1' ? 'Học kỳ 1' : sem === '2' ? 'Học kỳ 2' : 'Cả năm'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Lớp:</Text>
              <View style={styles.filterOptions}>
                {grades.map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[styles.filterOption, selectedGrade === grade && styles.activeFilter]}
                    onPress={() => setSelectedGrade(grade)}
                  >
                    <Text style={selectedGrade === grade ? styles.activeFilterText : styles.filterText}>
                      Lớp {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.reportContainer}>
              <Text style={styles.reportTitle}>
                Báo cáo học tập {className} - {semester === '1' ? 'Học kỳ 1' : semester === '2' ? 'Học kỳ 2' : 'Cả năm'}
              </Text>

              <View style={styles.chartContainer}>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={{
                      labels: subjects.filter(subj => !isPassFailSubject(subj)), // Chỉ hiển thị môn thường
                      datasets: [
                        {
                          data: subjects
                            .filter(subj => !isPassFailSubject(subj))
                            .map((subj) => averageScores[subj]),
                        },
                      ],
                    }}
                    width={Math.max(Dimensions.get('window').width - 40, subjects.length * 60)}
                    height={220}
                    yAxisLabel="Điểm "
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                    fromZero={true}
                  />
                </ScrollView>
              </View>

              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Tóm tắt:</Text>
                <Text style={styles.summaryText}>
                  - Điểm trung bình {semester === '1' ? 'học kỳ 1' : semester === '2' ? 'học kỳ 2' : 'cả năm'}: {overallAverage}
                </Text>
                {bestSubject && (
                  <Text style={styles.summaryText}>
                    - Môn học xuất sắc: {bestSubject} ({bestScore})
                  </Text>
                )}
                {worstSubject && (
                  <Text style={styles.summaryText}>
                    - Môn cần cải thiện: {worstSubject} ({worstScore})
                  </Text>
                )}
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>Chưa chọn lớp hoặc không có dữ liệu học sinh.</Text>
        )}
      </View>
    );
  };

  const renderAnalysis = () => {
    const weaknessAnalysis = calculateWeaknessAnalysis();
    const performanceDistribution = calculatePerformanceDistribution();

    return (
      <View style={styles.tabContent}>
        {/* Phần chọn lớp và học kỳ giống với tab Thống kê điểm */}
        <View style={styles.classPickerContainer}>
          <Text style={styles.filterLabel}>Chọn lớp:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedClassId}
              onValueChange={(itemValue) => setSelectedClassId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn lớp..." value={null} />
              {classList.map((cls) => (
                <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
              ))}
            </Picker>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0066CC" style={styles.loadingIndicator} />
        ) : errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : selectedClassId && studentsData.length > 0 ? (
          <>
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Học kỳ:</Text>
              <View style={styles.filterOptions}>
                {semesters.map((sem) => (
                  <TouchableOpacity
                    key={sem}
                    style={[styles.filterOption, semester === sem && styles.activeFilter]}
                    onPress={() => setSemester(sem)}
                  >
                    <Text style={semester === sem ? styles.activeFilterText : styles.filterText}>
                      {sem === '1' ? 'Học kỳ 1' : sem === '2' ? 'Học kỳ 2' : 'Cả năm'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Lớp:</Text>
              <View style={styles.filterOptions}>
                {grades.map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[styles.filterOption, selectedGrade === grade && styles.activeFilter]}
                    onPress={() => setSelectedGrade(grade)}
                  >
                    <Text style={selectedGrade === grade ? styles.activeFilterText : styles.filterText}>
                      Lớp {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>
                Phân tích học tập {className} - {semester === '1' ? 'Học kỳ 1' : semester === '2' ? 'Học kỳ 2' : 'Cả năm'}
              </Text>

              {weaknessAnalysis.length > 0 ? (
                <>
                  <Text style={[styles.summaryText, { fontWeight: 'bold', marginBottom: 10 }]}>
                    Điểm yếu cần cải thiện:
                  </Text>
                  {weaknessAnalysis.map((item, index) => (
                    <View key={index} style={styles.analysisItem}>
                      <Text style={styles.analysisSubject}>
                        {item.subject} (Điểm: {item.score})
                      </Text>
                      <Text style={styles.analysisText}>{item.improvement}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <Text style={styles.summaryText}>Không có môn học nào cần cải thiện.</Text>
              )}

              <Text style={[styles.summaryText, { fontWeight: 'bold', marginTop: 20 }]}>
                Phân bố năng lực học tập:
              </Text>
              <PieChart
                data={performanceDistribution}
                width={Dimensions.get('window').width - 40}
                height={200}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>Chưa chọn lớp hoặc không có dữ liệu học sinh.</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê học tập</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Xem thống kê điểm số' && styles.activeTab]}
          onPress={() => setActiveTab('Xem thống kê điểm số')}
        >
          <Text style={[styles.tabText, activeTab === 'Xem thống kê điểm số' && styles.activeTabText]}>
            Thống kê điểm
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Tạo báo cáo tổng quan' && styles.activeTab]}
          onPress={() => setActiveTab('Tạo báo cáo tổng quan')}
        >
          <Text style={[styles.tabText, activeTab === 'Tạo báo cáo tổng quan' && styles.activeTabText]}>
            Báo cáo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Phân tích dữ liệu học tập' && styles.activeTab]}
          onPress={() => setActiveTab('Phân tích dữ liệu học tập')}
        >
          <Text style={[styles.tabText, activeTab === 'Phân tích dữ liệu học tập' && styles.activeTabText]}>
            Phân tích
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {activeTab === 'Xem thống kê điểm số' && renderScoreStatistics()}
        {activeTab === 'Tạo báo cáo tổng quan' && renderReport()}
        {activeTab === 'Phân tích dữ liệu học tập' && renderAnalysis()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#0066CC',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0066CC',
  },
  tabText: {
    color: '#666666',
    fontSize: 14,
  },
  activeTabText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  tabContent: {
    marginBottom: 20,
  },
  classPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 55,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: '#0066CC',
  },
  filterText: {
    color: '#333',
  },
  activeFilterText: {
    color: 'white',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 15,
    marginBottom: 15,
    color: '#333',
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#0066CC',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  generateReportButton: {
    backgroundColor: '#0066CC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  generateReportText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  chartContainer: {
    marginVertical: 10,
  },
  summaryContainer: {
    marginTop: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 5,
    color: '#333',
  },
  analyzeButton: {
    backgroundColor: '#38A169',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  analysisItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  analysisSubject: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
  },
  passFailSubject: {
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  passFailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  passFailItem: {
    flex: 1,
    alignItems: 'center',
  },
  passFailLabel: {
    fontSize: 14,
    color: '#555',
  },
  passFailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38A169',
    marginTop: 5,
  },
  failValue: {
    color: '#E53E3E',
  },
  failListContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  failListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginBottom: 5,
  },
  failListItem: {
    fontSize: 14,
    color: '#E53E3E',
    marginLeft: 10,
  },
});

export default StatisticsScreen;
