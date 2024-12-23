# helm

helm template webapp --debug
 
helm install webapp ./webapp --dry-run --debug --version 1.0.0

helm list

kubectl port-forward webapp-deployment-9fccd564d-sxt27 30100:3000