// features/statistics/StatisticsScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const StatisticsScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Xem thống kê điểm số');
  const [semester, setSemester] = useState('1');
  const [schoolYear, setSchoolYear] = useState('2023-2024');
  const [subject, setSubject] = useState('Toán');

  // Dữ liệu demo
  const subjects = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh'];
  const semesters = ['1', '2'];
  const schoolYears = ['2022-2023', '2023-2024'];

  const averageScores = {
    'Toán': 8.5,
    'Văn': 7.2,
    'Anh': 8.0,
    'Lý': 7.8,
    'Hóa': 8.2,
    'Sinh': 7.5
  };

  const trendData = {
    labels: ['Học kỳ 1', 'Học kỳ 2'],
    datasets: [
      {
        data: [7.8, 8.2],
        color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
        strokeWidth: 2
      }
    ],
  };

  const weaknessAnalysis = [
    { subject: 'Văn', score: 7.2, improvement: 'Cần tập trung vào kỹ năng viết luận' },
    { subject: 'Sinh', score: 7.5, improvement: 'Cần ôn tập kỹ phần di truyền học' }
  ];

  const renderScoreStatistics = () => (
    <View style={styles.tabContent}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Học kỳ:</Text>
        <View style={styles.filterOptions}>
          {semesters.map((sem) => (
            <TouchableOpacity
              key={sem}
              style={[styles.filterOption, semester === sem && styles.activeFilter]}
              onPress={() => setSemester(sem)}
            >
              <Text style={semester === sem ? styles.activeFilterText : styles.filterText}>{sem}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Năm học:</Text>
        <View style={styles.filterOptions}>
          {schoolYears.map((year) => (
            <TouchableOpacity
              key={year}
              style={[styles.filterOption, schoolYear === year && styles.activeFilter]}
              onPress={() => setSchoolYear(year)}
            >
              <Text style={schoolYear === year ? styles.activeFilterText : styles.filterText}>{year}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Môn học:</Text>
        <View style={styles.filterOptions}>
          {subjects.map((subj) => (
            <TouchableOpacity
              key={subj}
              style={[styles.filterOption, subject === subj && styles.activeFilter]}
              onPress={() => setSubject(subj)}
            >
              <Text style={subject === subj ? styles.activeFilterText : styles.filterText}>{subj}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Kết quả thống kê:</Text>
        <Text style={styles.resultText}>
          Điểm trung bình môn {subject} học kỳ {semester} năm học {schoolYear}:
          <Text style={styles.highlightText}> {averageScores[subject]}</Text>
        </Text>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <LineChart
          data={trendData}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisLabel="Điểm "
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#0066CC'
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
        </ScrollView>

      </View>
    </View>
  );

  const renderReport = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.generateReportButton}>
        <Text style={styles.generateReportText}>Tạo báo cáo tổng quan</Text>
      </TouchableOpacity>

      <View style={styles.reportContainer}>
        <Text style={styles.reportTitle}>Báo cáo học tập năm học 2023-2024</Text>

        <View style={styles.chartContainer}>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <BarChart
            data={{
              labels: subjects,
              datasets: [{
                data: subjects.map(subj => averageScores[subj])
              }]
            }}
            width={Dimensions.get('window').width - 40}
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
              borderRadius: 16
            }}
          />
          </ScrollView>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tóm tắt:</Text>
          <Text style={styles.summaryText}>- Điểm trung bình cả năm: 7.8</Text>
          <Text style={styles.summaryText}>- Môn học xuất sắc: Toán (8.5)</Text>
          <Text style={styles.summaryText}>- Môn cần cải thiện: Văn (7.2)</Text>
        </View>
      </View>
    </View>
  );

  const renderAnalysis = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.analyzeButton}>
        <Text style={styles.analyzeButtonText}>Phân tích điểm yếu/mạnh</Text>
      </TouchableOpacity>

      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>Phân tích học tập:</Text>

        {weaknessAnalysis.map((item, index) => (
          <View key={index} style={styles.analysisItem}>
            <Text style={styles.analysisSubject}>{item.subject} (Điểm: {item.score})</Text>
            <Text style={styles.analysisText}>Gợi ý cải thiện: {item.improvement}</Text>
          </View>
        ))}

        <PieChart
          data={[
            {
              name: 'Xuất sắc',
              population: 2,
              color: '#38A169',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15
            },
            {
              name: 'Khá',
              population: 3,
              color: '#3182CE',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15
            },
            {
              name: 'Cần cải thiện',
              population: 1,
              color: '#DD6B20',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15
            }
          ]}
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
            borderRadius: 16
          }}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê học tập</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
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

      {/* Content */}
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
});

export default StatisticsScreen;
