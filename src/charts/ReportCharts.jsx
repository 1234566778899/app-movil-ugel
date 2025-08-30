import React from "react";
import { View, Text, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";

const MyPieChart = ({ index, data }) => {
    const screenWidth = Dimensions.get("window").width;
    return (
        <View style={{ alignItems: "center", marginTop: 20, backgroundColor: 'white', elevation: 1, paddingVertical: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                DESEMPEÑO {index}
            </Text>
            <PieChart
                data={data}
                width={screenWidth - 40}
                height={200}
                chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend
            />
        </View>
    );
};

export default MyPieChart;