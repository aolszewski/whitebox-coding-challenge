# whitebox-coding-challenge

Steps to Test:

1. Make you sure have docker installed
2. Run `docker-compose build`
3. Run `docker-compose up`
4. Once the containers are up, exec in to the exporter container `docker exec -it exporter bash`
5. Run `npm import`
6. Import the data using `npm run import`
7. Generate the excel document using `npm run export`
8. Copy the excel file to the local file system using `docker cp exporter:/src/results.xlsx .`
9. Open the file and verify that the export is correct
