<!DOCTYPE html>
<html>
  <head>
    <title>disCO2very statistics</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
  </head>
  <body>
    <style>
      body {
        font-family: sans-serif;
      }
      h1,
      h2 {
        text-align: center;
      }
      table {
        border-collapse: collapse;
      }
      tr:nth-child(even) {
        background-color: #ddd;
      }
      td {
        padding: 4px 6px;
      }
    </style>
    <h1>disCO2very statistics</h1>
    <h2><a href="https://disco2very.org">Access website</a></h2>
    <p><strong id="nbGames"></strong> games have been launched from <strong id="nbDevices"></strong> devices since 2026-02-10.</p>
    <p>Smallest width is <strong id="smallestWidth"></strong>px with <strong id="smallestWidthDevices"></strong> devices and smallest height is <strong id="smallestHeight"></strong>px with <strong id="smallestHeightDevices"></strong> device.</p>

    <div style="display: flex; gap: 3rem; flex-direction: row;">
      <div>
        <h3>Daily summary</h3>
        <table id="daily-stats">
          <tr>
            <th>Date</th>
            <th># Devices</th>
            <th># Games</th>
          </tr>
        </table>
      </div>
      <div>
        <h3>Unique resolution</h3>
        <table id="unique-resolutions">
          <tr>
            <th>Resolution</th>
            <th>#</th>
          </tr>
        </table>
      </div>
    </div>

    <h3>Row data</h3>
    <table id="raw-data">
      <tr>
        <th>Date</th>
        <th>App ID</th>
        <th>Categories mode</th>
        <th>User agent</th>
        <th>Resolution</th>
        <th>Pixel ratio</th>
        <th>Available resolution</th>
      </tr>
    </table>

    <script>
      <?php 
      /* We get the data with PHP and echo some JSON in JS variables in the page */
      include('db.php'); 
      try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);

        $all = $pdo->prepare("SELECT * FROM launchedGame ORDER BY date");
        $all->execute();
        echo 'const data = '.json_encode($all->fetchAll()).';';

        /*We group by UA and resolution to filter a bit better the appId = null case, which is happening on old browsers not supporting UUID crypto */
        $appIds = $pdo->prepare("SELECT appId, availableResolution FROM launchedGame GROUP BY appId, userAgent, availableResolution");
        $appIds->execute();
        echo 'const resolutions = '.json_encode($appIds->fetchAll()).';';

        $dailyStatsUniqueApps = $pdo->prepare("SELECT DATE(date) as day, COUNT(DISTINCT appId, userAgent, availableResolution) as devices FROM launchedGame GROUP BY day");
        $dailyStatsUniqueApps->execute();
        echo 'const dailyUniqueDevices = '.json_encode($dailyStatsUniqueApps->fetchAll()).';';
        $dailyStatsGames = $pdo->prepare("SELECT DATE(date) as day, COUNT(*) as dailyGames FROM launchedGame GROUP BY day");
        $dailyStatsGames->execute();
        echo 'const dailyGames = '.json_encode($dailyStatsGames->fetchAll()).';';

        $uniqueResolutions = $pdo->prepare("SELECT availableResolution as resolution, COUNT(availableResolution) as count FROM launchedGame GROUP BY availableResolution ORDER BY COUNT(availableResolution) DESC");
        $uniqueResolutions->execute();
        echo 'const uniqueResolutions = '.json_encode($uniqueResolutions->fetchAll()).';';

      } catch (Exception $e) {
        http_response_code(500);
        exit($e->getMessage());
      } ?>

      /* We have the data available now, so we process it in JS */

      /* Utility function */
      function insertProperty(object, propertyName) {
        const td = document.createElement("td");
        td.textContent = object[propertyName];
        return td;
      }

      /* Compute the summary at the top */
      document.getElementById("nbGames").textContent = data.length;
      document.getElementById("nbDevices").textContent = resolutions.length;
      
      let smallestWidth = 9999, smallestHeight = 9999;
      let smallestWidthDevices = 0, smallestHeightDevices = 0;
      for (let resolutionRow of resolutions) {
        const res = resolutionRow["availableResolution"].split("x");
        if (res.length === 2) {
          const width = parseInt(res[0]);
          const height = parseInt(res[1]);
          if (width < smallestWidth) {
            smallestWidth = width;
            smallestWidthDevices = 1;
          } else if (width === smallestWidth) {
            smallestWidthDevices++;
          }
          if (height < smallestHeight) {
            smallestHeight = height;
            smallestHeightDevices = 1;
          } else if (height === smallestHeight) {
            smallestHeightDevices++;
          }
        } else {
          console.error(resolutionRow["availableResolution"] + " is not a valid resolution (widthxheight)");
        }
      }

      document.getElementById("smallestWidth").textContent = smallestWidth;
      document.getElementById("smallestWidthDevices").textContent = smallestWidthDevices;
      document.getElementById("smallestHeight").textContent = smallestHeight;
      document.getElementById("smallestHeightDevices").textContent = smallestHeightDevices;

      /* Compute the daily stats table */
      const dailyStatsTable = document.getElementById("daily-stats");
      for (let i = 0; i < dailyGames.length; i++) {
        const tr = document.createElement("tr");
        tr.appendChild(insertProperty(dailyGames[i], "day"));
        tr.appendChild(insertProperty(dailyUniqueDevices[i], "devices"));
        tr.appendChild(insertProperty(dailyGames[i], "dailyGames"));
        dailyStatsTable.appendChild(tr);
      }

      /* Compute unique resolution */
      const uniqueResolutionsTable = document.getElementById("unique-resolutions");
      for (let resolution of uniqueResolutions) {
        const tr = document.createElement("tr");
        tr.appendChild(insertProperty(resolution, "resolution"));
        tr.appendChild(insertProperty(resolution, "count"));
        uniqueResolutionsTable.appendChild(tr);
      }

      /* Compute the raw data table */
      const rawDataTable = document.getElementById("raw-data");
      for (let game of data) {
        const tr = document.createElement("tr");
        tr.appendChild(insertProperty(game, "date"));
        tr.appendChild(insertProperty(game, "appId"));
        tr.appendChild(insertProperty(game, "categoriesMode"));
        tr.appendChild(insertProperty(game, "userAgent"));
        tr.appendChild(insertProperty(game, "resolution"));
        tr.appendChild(insertProperty(game, "pixelRatio"));
        tr.appendChild(insertProperty(game, "availableResolution"));
        rawDataTable.appendChild(tr);
      }
    </script>
  </body>
</html>