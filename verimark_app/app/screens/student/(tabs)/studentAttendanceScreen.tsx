
// import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useState } from 'react';

const { width } = Dimensions.get('window');

const StudentAttendanceScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');

  // Sample data
  const attendanceData = {
    percentage: 100,
    attended: 35,
    total: 40,
    status: 'Excellent!'
  };

  const chartData = [
    { date: 'May 13', present: 95, late: 0, absent: 5 },
    { date: 'May 14', present: 90, late: 5, absent: 5 },
    { date: 'May 15', present: 85, late: 10, absent: 5 },
    { date: 'May 16', present: 95, late: 0, absent: 5 },
    { date: 'May 17', present: 100, late: 0, absent: 0 },
  ];

  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const size = 120;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.circularProgressContainer}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E8F4FD"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#007AFF"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
        </View>
      </View>
    );
  };

  const BarChart = ({ data }: { data: { date: string; present: number; late: number; absent: number }[] }) => {
    const chartWidth = width - 40;
    const chartHeight = 150;
    const barWidth = (chartWidth - 60) / data.length;
    const maxValue = 100;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartYAxis}>
          <Text style={styles.yAxisLabel}>Present</Text>
          <Text style={styles.yAxisLabel}>Late</Text>
          <Text style={styles.yAxisLabel}>Absent</Text>
        </View>
        
        <Svg width={chartWidth} height={chartHeight + 30}>
          {data.map((item, index) => {
            const x = index * barWidth + 30;
            const presentHeight = (item.present / maxValue) * chartHeight;
            const lateHeight = (item.late / maxValue) * chartHeight;
            const absentHeight = (item.absent / maxValue) * chartHeight;

            return (
              <View key={index}>
                {/* Present bar */}
                <Rect
                  x={x}
                  y={chartHeight - presentHeight}
                  width={barWidth - 10}
                  height={presentHeight}
                  fill="#4CAF50"
                  rx={2}
                />
                {/* Late bar */}
                <Rect
                  x={x + barWidth - 8}
                  y={chartHeight - lateHeight}
                  width={barWidth - 10}
                  height={lateHeight}
                  fill="#FFC107"
                  rx={2}
                />
              </View>
            );
          })}
        </Svg>
        
        <View style={styles.xAxisContainer}>
          {data.map((item, index) => (
            <Text key={index} style={styles.xAxisLabel}>
              {item.date.split(' ')[1]}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.appIconContainer}>
            <Ionicons name="diamond" size={24} color="#007AFF" />
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.notificationBadge}>
            <View style={styles.redDot} />
          </View>
          <View style={styles.profileContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
            <View style={styles.profileImage2}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Attendance Section */}
        <View style={styles.attendanceSection}>
          <CircularProgress percentage={attendanceData.percentage} />
          <View style={styles.attendanceInfo}>
            <Text style={styles.attendanceTitle}>Overall Attendance</Text>
            <Text style={styles.attendanceSubtitle}>
              {attendanceData.attended} of {attendanceData.total} classes Attended
            </Text>
            <Text style={styles.attendanceStatus}>{attendanceData.status}</Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#FFF9C4' }]}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFCDD2' }]}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['This Week', 'This Month', 'This Semester'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriodButton
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.selectedPeriodButtonText
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Attendance Trend */}
        <View style={styles.trendSection}>
          <Text style={styles.trendTitle}>Attendance Trend</Text>
          <BarChart data={chartData} />
        </View>
      </ScrollView>

      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'relative',
    marginRight: 15,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    marginLeft: -10,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileImage2: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  attendanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circularProgressContainer: {
    position: 'relative',
    marginRight: 20,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  attendanceSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  attendanceStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    marginTop: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPeriodButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  trendSection: {
    marginTop: 25,
    marginBottom: 20,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartYAxis: {
    position: 'absolute',
    left: 0,
    top: 20,
    height: 150,
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#666',
    transform: [{ rotate: '-90deg' }],
    width: 60,
    textAlign: 'center',
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingLeft: 30,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeTab: {
    // Active tab styling handled by icon and text color
  },
  tabLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default StudentAttendanceScreen;