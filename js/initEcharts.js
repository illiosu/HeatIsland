/**
 * 实现登录功能
 */
const loginBox = document.querySelector(".login-content");
const button = document.querySelector(".login");
const username = document.querySelector(".username");
const password = document.querySelector(".password");
button.addEventListener("click", () => {
  loginBox.style.display = "none";
  // fetch('http://127.0.0.1:3000/api/login', {
  //   method: 'post',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   },
  //   body: new URLSearchParams({
  //     'username': username.value,
  //     'password': password.value
  //   })
  // }).then((response) => response.json())
  //   .then((res) => {
  //     loginBox.style.display = 'none'
  //     // if (res.status == 200) {
  //     //   loginBox.style.display = 'none'
  //     // } else {
  //     //   alert('账号或密码错误！')
  //     // }
  //   })
});

/**
 * 控制图表页面的关闭与隐藏
 */
const icon = document.querySelector(".icon");
const echartBox = document.querySelector(".main-content");
const timeselector = document.querySelector(".time-selector");
timeselector.style.display = "none";
const waringicon = document.querySelector(".waring-icon");
waringicon.style.display = "none";
icon.addEventListener("click", () => {
  echartBox.style.display = "none";
});

const echartShow = document.querySelector(".echarts-show");
const but1 = document.querySelector(".button1");
const sid1 = document.querySelector("#sid1");
const but2 = document.querySelector(".button2");
const sid2 = document.querySelector("#sid2");
const but3 = document.querySelector(".button3");
const sid3 = document.querySelector("#sid3");
const but4 = document.querySelector(".button4");
const sid4 = document.querySelector("#sid4");

// 点击了图表分析
echartShow.addEventListener("click", () => {
  fetch("http://127.0.0.1:3000/api/forest")
    .then((response) => response.json())
    .then((res) => {
      initEcharts(res.data, 2014);
      but2.addEventListener("click", () => {
        initEcharts(res.data, sid2.value);
      });
    })
    .catch((error) => console.error(error));

  fetch("http://127.0.0.1:3000/api/district")
    .then((response) => response.json())
    .then((res) => {
      initEcharts3(res.data, "强冷岛区");
      but3.addEventListener("click", () => {
        initEcharts3(res.data, sid3.value);
      });
    })
    .catch((error) => console.error(error));

  fetch("http://127.0.0.1:3000/api/heat_island")
    .then((response) => response.json())
    .then((res) => {
      initEcharts2(res.data, 2013);
      but1.addEventListener("click", () => {
        initEcharts2(res.data, sid1.value);
      });
    })
    .catch((error) => console.error(error));

  fetch("http://127.0.0.1:3000/api/heat_island")
    .then((response) => response.json())
    .then((res) => {
      initEcharts4(res.data, "强冷岛区");
      but4.addEventListener("click", () => {
        initEcharts4(res.data, sid4.value);
      });
    })
    .catch((error) => console.error(error));
});

// 折线图
function initEcharts(data, year) {
  const name = data.map((item) => {
    return item.name;
  });
  const min = data.map((item) => {
    let minyear = "min" + year;
    return item[minyear];
  });
  const max = data.map((item) => {
    let maxyear = "max" + year;
    return item[maxyear];
  });
  const avg = data.map((item) => {
    let avgyear = "avg" + year;
    return item[avgyear];
  });
  const myChart = echarts.init(document.querySelector("#echart3"));
  // 指定图表的配置项和数据
  var option = (option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["最大气温", "平均气温", "最小气温"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },

    xAxis: {
      type: "category",
      boundaryGap: false,
      data: name,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "最大气温",
        type: "line",
        data: max,
      },
      {
        name: "平均气温",
        type: "line",
        data: avg,
      },
      {
        name: "最小气温",
        type: "line",
        data: min,
      },
    ],
  });

  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
  window.addEventListener("resize", () => {
    myChart.resize();
  });
}

function initEcharts2(data, year) {
  const myChart = echarts.init(document.querySelector("#echart"));

  const newArray = data.map((item) => {
    return { name: item["category"], value: Number(item[year]) };
  });

  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "占比",
        type: "pie",
        radius: "50%",
        data: newArray,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
  window.addEventListener("resize", () => {
    myChart.resize();
  });
}

function initEcharts3(data, category) {
  const myChart = echarts.init(document.querySelector("#echart2"));

  let newArray = [];

  data.map((item) => {
    if (item.category == category) {
      newArray.push(item);
    }
  });

  const newArray2 = newArray.map((item) => {
    return { name: item["adress"], value: Number(item["2017"]) };
  });

  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [
      {
        name: "占比",
        type: "pie",
        radius: ["30%", "50%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: newArray2,
      },
    ],
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
  window.addEventListener("resize", () => {
    myChart.resize();
  });
}

function initEcharts4(data, category) {
  const myChart = echarts.init(document.querySelector("#echart4"));

  console.log(data);

  let name = [];
  let values = [];
  const newData = data.find((item) => {
    return item.category == category;
  });

  console.log(newData);

  for (const [key, value] of Object.entries(newData)) {
    if (key !== "category" && key !== "id") {
      name.push(key);
      values.push(value);
    }
  }
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: name,
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        name: "值",
        type: "bar",
        barWidth: "60%",
        data: values,
      },
    ],
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
  window.addEventListener("resize", () => {
    myChart.resize();
  });
}
