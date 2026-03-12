import torch
import torch.nn as nn


def train(model, trainloader, optimizer):

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model.train()
    model.to(device)

    criterion = nn.CrossEntropyLoss()

    epochs = 1

    for epoch in range(epochs):

        for X, y in trainloader:

            X = X.to(device)
            y = y.to(device)

            optimizer.zero_grad()

            outputs = model(X)

            loss = criterion(outputs, y)

            loss.backward()

            optimizer.step()

    return model


def evaluate(model, trainloader):

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model.eval()
    model.to(device)

    criterion = nn.CrossEntropyLoss()

    total = 0
    correct = 0
    total_loss = 0

    with torch.no_grad():

        for X, y in trainloader:

            X = X.to(device)
            y = y.to(device)

            outputs = model(X)

            loss = criterion(outputs, y)

            total_loss += loss.item()

            _, predicted = torch.max(outputs, 1)

            total += y.size(0)
            correct += (predicted == y).sum().item()

    accuracy = correct / total if total > 0 else 0

    return total_loss, accuracy