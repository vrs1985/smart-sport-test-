var progress = [100, 100, 10];
  var seasons = [
    {
      id : 36,
      dateFrom : “25-05-2017”,
      dateTo : “20-07-2017”,
      schedules : [
        {
          timeFrom : 28800, // кол-во секунд от начала дня
          timeTo : 72000,
          days : [“mon”,”tue”,”wed”,”thu”,”fri”]
        },
        {
          timeFrom : 36000, // кол-во секунд от начала дня
          timeTo : 64800,
          days : [“sat”,”sun”]
        },
      ]
    }
  ];
  var categories = [“USA”,”Mexico”,”Russian”,”France”,”Ukraine”,”China”,”Korea”];
  var bathrooms = [
    {
      id : 65,
      title : “half”
    },
    {
      id : 98,
      title : “second”
    }
  ];
  var prices = [
    {
      id : 11,
      season : 36,
      bathroom : 65,
      category : “Russian”,
      type : “athlete”
    },
    {
      id : 11,
      season : 36,
      bathroom : 65,
      category : “Mexico”,
      type : “lane”
    },
    {
      id : 11,
      season : 36,
      bathroom : 65,
      category : null,
      type : “swimming”
    },
  ];
